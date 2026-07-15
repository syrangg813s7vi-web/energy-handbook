#!/usr/bin/env node
import {
  createHmac,
  createPublicKey,
  randomBytes,
  randomUUID,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const encoder = new TextEncoder();

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

function signSession(secret, email, now, ttlSeconds) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const expiresAt = new Date(now + ttlSeconds * 1000);
  const payload = base64url(JSON.stringify({
    iss: "energy-review-gateway",
    aud: "energy-handbook-review",
    sub: email,
    email,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    jti: randomUUID(),
  }));
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return { token: `${header}.${payload}.${signature}`, email, expiresAt: expiresAt.toISOString() };
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
      || !claims.email
      || !Number.isFinite(claims.exp)
      || claims.exp <= nowSeconds) return null;
    return claims;
  } catch {
    return null;
  }
}

export function createAccessVerifier({ teamDomain, audience, fetchImpl = fetch, now = Date.now }) {
  const issuer = String(teamDomain || "").replace(/\/$/, "");
  let cachedKeys = new Map();
  let cacheExpiresAt = 0;

  async function getKey(kid) {
    if (now() >= cacheExpiresAt || !cachedKeys.has(kid)) {
      const response = await fetchImpl(`${issuer}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(5_000) });
      if (!response.ok) throw new Error("无法读取 Cloudflare Access 公钥");
      const body = await response.json();
      cachedKeys = new Map((body.keys || []).map((jwk) => [jwk.kid, createPublicKey({ key: jwk, format: "jwk" })]));
      cacheExpiresAt = now() + 60 * 60 * 1000;
    }
    return cachedKeys.get(kid);
  }

  return async (token) => {
    const parts = String(token || "").split(".");
    if (!issuer || !audience || parts.length !== 3) return null;
    try {
      const header = decodeJson(parts[0]);
      const claims = decodeJson(parts[1]);
      const nowSeconds = Math.floor(now() / 1000);
      const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
      if (header.alg !== "RS256" || !header.kid
        || claims.iss !== issuer || !audiences.includes(audience)
        || !claims.email || claims.exp <= nowSeconds
        || (claims.nbf && claims.nbf > nowSeconds + 30)) return null;
      const key = await getKey(header.kid);
      if (!key) return null;
      const valid = verifySignature(
        "RSA-SHA256",
        encoder.encode(`${parts[0]}.${parts[1]}`),
        key,
        Buffer.from(parts[2], "base64url"),
      );
      return valid ? claims : null;
    } catch {
      return null;
    }
  };
}

export function createReviewGateway(options = {}) {
  const now = options.now ?? Date.now;
  const allowedOrigins = new Set(options.allowedOrigins ?? parseCsv(process.env.REVIEW_ALLOWED_ORIGINS));
  const sessionSecret = options.sessionSecret ?? process.env.REVIEW_SESSION_SECRET ?? "";
  const gatewayToken = options.gatewayToken ?? process.env.REVIEW_N8N_GATEWAY_TOKEN ?? "";
  const n8nBaseUrl = String(options.n8nBaseUrl ?? process.env.REVIEW_N8N_BASE_URL ?? "http://127.0.0.1:5678").replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const verifyAccess = options.verifyAccess ?? createAccessVerifier({
    teamDomain: process.env.CF_ACCESS_TEAM_DOMAIN,
    audience: process.env.CF_ACCESS_AUD,
    fetchImpl,
    now,
  });
  const codeTtlMs = options.codeTtlMs ?? 2 * 60 * 1000;
  const sessionTtlSeconds = options.sessionTtlSeconds ?? 15 * 60;
  const maxBodyBytes = options.maxBodyBytes ?? 32 * 1024;
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
        const claims = await verifyAccess(request.headers["cf-access-jwt-assertion"]);
        if (!claims) return fail(response, 401, "invalid_access_token", "Cloudflare Access 登录无效");
        const code = randomBytes(32).toString("base64url");
        codes.set(code, { email: claims.email, expiresAt: now() + codeTtlMs });
        returnTo.searchParams.set("review_code", code);
        response.writeHead(302, { "cache-control": "no-store", location: returnTo.toString() });
        return response.end();
      }

      if (request.method === "POST" && url.pathname === "/auth/exchange") {
        if (!allowedOrigins.has(origin)) return fail(response, 403, "forbidden", "不允许的站点来源");
        const { code } = await readJson(request, maxBodyBytes);
        const grant = codes.get(code);
        codes.delete(code);
        if (!grant || grant.expiresAt <= now()) return fail(response, 400, "invalid_code", "登录授权码无效或已过期", cors);
        return json(response, 200, signSession(sessionSecret, grant.email, now(), sessionTtlSeconds), cors);
      }

      const claims = authorize(request);
      if ((url.pathname === "/reviews" || url.pathname.startsWith("/reviews/")) && !allowedOrigins.has(origin)) {
        return fail(response, 403, "forbidden", "不允许的站点来源");
      }
      if (request.method === "POST" && url.pathname === "/reviews") {
        if (!claims) return fail(response, 401, "unauthorized", "登录已过期", cors);
        if (!canSubmit(claims.email)) return fail(response, 429, "rate_limited", "提交过于频繁，请稍后重试", cors);
        const payload = await readJson(request, maxBodyBytes);
        return proxyN8n(response, "/webhook/energy-handbook/reviews", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...payload, actorEmail: claims.email }),
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
  const required = ["REVIEW_SESSION_SECRET", "REVIEW_N8N_GATEWAY_TOKEN", "CF_ACCESS_TEAM_DOMAIN", "CF_ACCESS_AUD"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  const host = process.env.REVIEW_GATEWAY_HOST || "127.0.0.1";
  const port = Number(process.env.REVIEW_GATEWAY_PORT || 8790);
  createReviewGateway().listen(port, host, () => {
    process.stdout.write(`energy-review-gateway listening on http://${host}:${port}\n`);
  });
}
