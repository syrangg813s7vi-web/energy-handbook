#!/usr/bin/env node
import {
  createHmac,
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(response, statusCode, body, headers = {}) {
  const content = JSON.stringify(body);
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(content),
    ...headers,
  });
  response.end(content);
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function decodeJson(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function parseCsv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function corsHeaders(origin, allowedOrigins) {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

async function readJson(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error("请求体超过限制"), { statusCode: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("请求体必须是有效 JSON"), { statusCode: 400 });
  }
}

function validReturnTo(value, allowedOrigins) {
  try {
    const url = new URL(value);
    if (!allowedOrigins.has(url.origin) || url.username || url.password || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}

function signSession(secret, identity, now, ttlSeconds) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const expiresAt = new Date(now + ttlSeconds * 1000);
  const payload = base64url(JSON.stringify({
    iss: "energy-review-gateway",
    aud: "energy-handbook-review",
    sub: `github:${identity.id}`,
    email: `@${identity.login}`,
    githubId: String(identity.id),
    githubLogin: identity.login,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    jti: randomUUID(),
  }));
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return { token: `${header}.${payload}.${signature}`, email: `@${identity.login}`, expiresAt: expiresAt.toISOString() };
}

function verifySession(token, secret, now) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  if (!safeEqual(expected, parts[2])) return null;
  try {
    const header = decodeJson(parts[0]);
    const claims = decodeJson(parts[1]);
    const nowSeconds = Math.floor(now / 1000);
    if (header.alg !== "HS256"
      || claims.iss !== "energy-review-gateway"
      || claims.aud !== "energy-handbook-review"
      || !claims.email || !claims.githubId || !claims.githubLogin
      || !Number.isFinite(claims.exp)
      || claims.exp <= nowSeconds) return null;
    return claims;
  } catch {
    return null;
  }
}

export function createReviewGateway(options = {}) {
  const now = options.now ?? Date.now;
  const allowedOrigins = new Set(options.allowedOrigins ?? parseCsv(process.env.REVIEW_ALLOWED_ORIGINS));
  const sessionSecret = options.sessionSecret ?? process.env.REVIEW_SESSION_SECRET ?? "";
  const gatewayToken = options.gatewayToken ?? process.env.REVIEW_N8N_GATEWAY_TOKEN ?? "";
  const n8nBaseUrl = String(options.n8nBaseUrl ?? process.env.REVIEW_N8N_BASE_URL ?? "http://127.0.0.1:5678").replace(/\/$/, "");
  const publicBaseUrl = String(options.publicBaseUrl ?? process.env.REVIEW_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const githubClientId = options.githubClientId ?? process.env.GITHUB_OAUTH_CLIENT_ID ?? "";
  const githubClientSecret = options.githubClientSecret ?? process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "";
  const allowedGithubIds = new Set(options.allowedGithubIds ?? parseCsv(process.env.REVIEW_ALLOWED_GITHUB_IDS));
  const fetchImpl = options.fetchImpl ?? fetch;
  const codeTtlMs = options.codeTtlMs ?? 2 * 60 * 1000;
  const sessionTtlSeconds = options.sessionTtlSeconds ?? 15 * 60;
  const maxBodyBytes = options.maxBodyBytes ?? 32 * 1024;
  const oauthStates = new Map();
  const codes = new Map();
  const submitWindows = new Map();

  function fail(response, statusCode, error, message, headers = {}) {
    return json(response, statusCode, { ok: false, error, message }, headers);
  }

  function authorize(request) {
    const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
    return verifySession(token, sessionSecret, now());
  }

  function canSubmit(email) {
    const cutoff = now() - 10 * 60 * 1000;
    const recent = (submitWindows.get(email) || []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= 5) return false;
    recent.push(now());
    submitWindows.set(email, recent);
    return true;
  }

  async function proxyN8n(response, endpoint, init, headers) {
    const upstream = await fetchImpl(`${n8nBaseUrl}${endpoint}`, {
      ...init,
      headers: { ...init.headers, "x-energy-review-gateway-token": gatewayToken },
      signal: AbortSignal.timeout(30_000),
    });
    const body = await upstream.json().catch(() => ({ ok: false, message: "批阅服务返回了无效响应" }));
    return json(response, upstream.status, body, headers);
  }

  async function authenticateGithub(code, codeVerifier) {
    const tokenResponse = await fetchImpl("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "user-agent": "energy-handbook-review-gateway" },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        redirect_uri: `${publicBaseUrl}/auth/callback`,
        code_verifier: codeVerifier,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenBody.access_token) return null;
    const userResponse = await fetchImpl("https://api.github.com/user", {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${tokenBody.access_token}`,
        "user-agent": "energy-handbook-review-gateway",
        "x-github-api-version": "2022-11-28",
      },
      signal: AbortSignal.timeout(10_000),
    });
    const user = await userResponse.json();
    if (!userResponse.ok || !user.id || !user.login) return null;
    return { id: String(user.id), login: String(user.login).slice(0, 100) };
  }

  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://gateway.local");
    const origin = String(request.headers.origin || "");
    const cors = corsHeaders(origin, allowedOrigins);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return json(response, 200, { ok: true, service: "energy-review-gateway" });
    }
    if (request.method === "OPTIONS") {
      if (!allowedOrigins.has(origin)) return fail(response, 403, "forbidden", "不允许的站点来源");
      response.writeHead(204, cors);
      return response.end();
    }

    try {
      if (request.method === "GET" && url.pathname === "/auth/start") {
        const returnTo = validReturnTo(url.searchParams.get("return_to"), allowedOrigins);
        if (!returnTo) return fail(response, 400, "invalid_return_to", "登录返回地址无效");
        const state = randomBytes(32).toString("base64url");
        const codeVerifier = randomBytes(48).toString("base64url");
        const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
        oauthStates.set(state, { returnTo, codeVerifier, expiresAt: now() + 10 * 60 * 1000 });
        const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
        authorizeUrl.searchParams.set("client_id", githubClientId);
        authorizeUrl.searchParams.set("redirect_uri", `${publicBaseUrl}/auth/callback`);
        authorizeUrl.searchParams.set("state", state);
        authorizeUrl.searchParams.set("code_challenge", codeChallenge);
        authorizeUrl.searchParams.set("code_challenge_method", "S256");
        authorizeUrl.searchParams.set("allow_signup", "false");
        response.writeHead(302, { "cache-control": "no-store", location: authorizeUrl.toString() });
        return response.end();
      }

      if (request.method === "GET" && url.pathname === "/auth/callback") {
        const state = url.searchParams.get("state");
        const grant = oauthStates.get(state);
        oauthStates.delete(state);
        if (!grant || grant.expiresAt <= now() || !url.searchParams.get("code")) {
          return fail(response, 400, "invalid_oauth_callback", "GitHub 登录请求无效或已过期");
        }
        const identity = await authenticateGithub(url.searchParams.get("code"), grant.codeVerifier);
        if (!identity || !allowedGithubIds.has(identity.id)) {
          return fail(response, 403, "github_user_not_allowed", "该 GitHub 账户没有批阅权限");
        }
        const code = randomBytes(32).toString("base64url");
        codes.set(code, { identity, expiresAt: now() + codeTtlMs });
        grant.returnTo.searchParams.set("review_code", code);
        response.writeHead(302, { "cache-control": "no-store", location: grant.returnTo.toString() });
        return response.end();
      }

      if (request.method === "POST" && url.pathname === "/auth/exchange") {
        if (!allowedOrigins.has(origin)) return fail(response, 403, "forbidden", "不允许的站点来源");
        const { code } = await readJson(request, maxBodyBytes);
        const grant = codes.get(code);
        codes.delete(code);
        if (!grant || grant.expiresAt <= now()) return fail(response, 400, "invalid_code", "登录授权码无效或已过期", cors);
        return json(response, 200, signSession(sessionSecret, grant.identity, now(), sessionTtlSeconds), cors);
      }

      const claims = authorize(request);
      if ((url.pathname === "/reviews" || url.pathname.startsWith("/reviews/")) && !allowedOrigins.has(origin)) {
        return fail(response, 403, "forbidden", "不允许的站点来源");
      }
      if (request.method === "POST" && url.pathname === "/reviews") {
        if (!claims) return fail(response, 401, "unauthorized", "登录已过期", cors);
        if (!canSubmit(claims.sub)) return fail(response, 429, "rate_limited", "提交过于频繁，请稍后重试", cors);
        const payload = await readJson(request, maxBodyBytes);
        return proxyN8n(response, "/webhook/energy-handbook/reviews", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...payload, actorEmail: `github:${claims.githubLogin}#${claims.githubId}` }),
        }, cors);
      }

      const statusMatch = url.pathname.match(/^\/reviews\/([A-Za-z0-9_-]{12,})$/);
      if (request.method === "GET" && statusMatch) {
        if (!claims) return fail(response, 401, "unauthorized", "登录已过期", cors);
        return proxyN8n(response, `/webhook/energy-handbook/reviews/${statusMatch[1]}`, { method: "GET" }, cors);
      }

      return fail(response, 404, "not_found", "未找到该接口", cors);
    } catch (error) {
      const statusCode = Number(error?.statusCode) || 502;
      return fail(response, statusCode, statusCode < 500 ? "invalid_request" : "gateway_error",
        statusCode < 500 ? error.message : "批阅网关暂时不可用", cors);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const required = [
    "REVIEW_SESSION_SECRET",
    "REVIEW_N8N_GATEWAY_TOKEN",
    "REVIEW_PUBLIC_BASE_URL",
    "REVIEW_ALLOWED_ORIGINS",
    "GITHUB_OAUTH_CLIENT_ID",
    "GITHUB_OAUTH_CLIENT_SECRET",
    "REVIEW_ALLOWED_GITHUB_IDS",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  const host = process.env.REVIEW_GATEWAY_HOST || "127.0.0.1";
  const port = Number(process.env.REVIEW_GATEWAY_PORT || 8790);
  createReviewGateway().listen(port, host, () => {
    process.stdout.write(`energy-review-gateway listening on http://${host}:${port}\n`);
  });
}
