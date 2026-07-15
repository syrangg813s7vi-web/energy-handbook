import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";
import { createAccessVerifier, createReviewGateway } from "./review-gateway.mjs";

const siteOrigin = "https://syrangg813s7vi-web.github.io";

function accessToken(privateKey, claims, kid = "test-key") {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", kid })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), privateKey).toString("base64url");
  return `${header}.${payload}.${signature}`;
}

async function withGateway(run) {
  const upstreamCalls = [];
  const server = createReviewGateway({
    allowedOrigins: [siteOrigin],
    sessionSecret: "a-test-secret-with-enough-entropy",
    gatewayToken: "gateway-test-token",
    n8nBaseUrl: "http://n8n.internal",
    verifyAccess: async (token) => token === "valid-access-jwt" ? { email: "owner@example.com" } : null,
    fetchImpl: async (url, init) => {
      upstreamCalls.push([url, init]);
      return new Response(JSON.stringify({ ok: true, jobId: "task_abcdefghijkl" }), {
        status: 202,
        headers: { "content-type": "application/json" },
      });
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(origin, upstreamCalls);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function login(origin) {
  const start = await fetch(`${origin}/auth/start?return_to=${encodeURIComponent(`${siteOrigin}/energy-handbook/knowledge/energy-basics`)}`, {
    headers: { "cf-access-jwt-assertion": "valid-access-jwt" },
    redirect: "manual",
  });
  const code = new URL(start.headers.get("location")).searchParams.get("review_code");
  const exchange = await fetch(`${origin}/auth/exchange`, {
    method: "POST",
    headers: { origin: siteOrigin, "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return exchange.json();
}

test("只接受允许站点的登录返回地址和有效 Access JWT", async () => withGateway(async (origin) => {
  const badReturn = await fetch(`${origin}/auth/start?return_to=https://evil.example/`, {
    headers: { "cf-access-jwt-assertion": "valid-access-jwt" },
    redirect: "manual",
  });
  assert.equal(badReturn.status, 400);
  const badJwt = await fetch(`${origin}/auth/start?return_to=${encodeURIComponent(`${siteOrigin}/energy-handbook/`)}`, { redirect: "manual" });
  assert.equal(badJwt.status, 401);
}));

test("登录授权码只能交换一次", async () => withGateway(async (origin) => {
  const start = await fetch(`${origin}/auth/start?return_to=${encodeURIComponent(`${siteOrigin}/energy-handbook/`)}`, {
    headers: { "cf-access-jwt-assertion": "valid-access-jwt" },
    redirect: "manual",
  });
  const code = new URL(start.headers.get("location")).searchParams.get("review_code");
  const request = () => fetch(`${origin}/auth/exchange`, {
    method: "POST",
    headers: { origin: siteOrigin, "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  assert.equal((await request()).status, 200);
  assert.equal((await request()).status, 400);
}));

test("短期令牌绑定审核者身份并通过网关凭据转发", async () => withGateway(async (origin, calls) => {
  const session = await login(origin);
  const response = await fetch(`${origin}/reviews`, {
    method: "POST",
    headers: { origin: siteOrigin, authorization: `Bearer ${session.token}`, "content-type": "application/json" },
    body: JSON.stringify({ pagePath: "/energy-handbook/knowledge/energy-basics", actorEmail: "attacker@example.com" }),
  });
  assert.equal(response.status, 202);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].headers["x-energy-review-gateway-token"], "gateway-test-token");
  assert.equal(JSON.parse(calls[0][1].body).actorEmail, "owner@example.com");
}));

test("拒绝无令牌、错误来源和非法预检请求", async () => withGateway(async (origin) => {
  const noToken = await fetch(`${origin}/reviews`, { method: "POST", headers: { origin: siteOrigin }, body: "{}" });
  assert.equal(noToken.status, 401);
  const wrongOrigin = await fetch(`${origin}/reviews`, { method: "POST", headers: { origin: "https://evil.example" }, body: "{}" });
  assert.equal(wrongOrigin.status, 403);
  const preflight = await fetch(`${origin}/reviews`, { method: "OPTIONS", headers: { origin: siteOrigin } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), siteOrigin);
}));

test("验证 Cloudflare Access 的签名、issuer 和 audience", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = publicKey.export({ format: "jwk" });
  Object.assign(jwk, { alg: "RS256", kid: "test-key", use: "sig" });
  const now = 1_800_000_000_000;
  const verify = createAccessVerifier({
    teamDomain: "https://energy-review.cloudflareaccess.com",
    audience: "expected-audience",
    now: () => now,
    fetchImpl: async () => new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }),
  });
  const claims = {
    iss: "https://energy-review.cloudflareaccess.com",
    aud: ["expected-audience"],
    email: "owner@example.com",
    exp: Math.floor(now / 1000) + 300,
  };
  assert.equal((await verify(accessToken(privateKey, claims))).email, "owner@example.com");
  assert.equal(await verify(accessToken(privateKey, { ...claims, aud: ["wrong-audience"] })), null);
});
