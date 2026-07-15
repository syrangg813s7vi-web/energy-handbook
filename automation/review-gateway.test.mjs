import assert from "node:assert/strict";
import test from "node:test";
import { createReviewGateway } from "./review-gateway.mjs";

const siteOrigin = "https://syrangg813s7vi-web.github.io";

async function withGateway(run, options = {}) {
  const upstreamCalls = [];
  const githubUser = options.githubUser ?? { id: 12345678, login: "energy-owner" };
  const server = createReviewGateway({
    allowedOrigins: [siteOrigin],
    sessionSecret: "a-test-secret-with-enough-entropy",
    gatewayToken: "gateway-test-token",
    n8nBaseUrl: "http://n8n.internal",
    publicBaseUrl: "https://review.example.test",
    githubClientId: "test-client-id",
    githubClientSecret: "test-client-secret",
    allowedGithubIds: options.allowedGithubIds ?? ["12345678"],
    fetchImpl: async (url, init = {}) => {
      upstreamCalls.push([String(url), init]);
      if (url === "https://github.com/login/oauth/access_token") {
        return new Response(JSON.stringify({ access_token: "github-test-token", token_type: "bearer", scope: "" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url === "https://api.github.com/user") {
        return new Response(JSON.stringify(githubUser), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
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

async function beginLogin(origin, returnTo = `${siteOrigin}/energy-handbook/knowledge/energy-basics`) {
  const start = await fetch(`${origin}/auth/start?return_to=${encodeURIComponent(returnTo)}`, { redirect: "manual" });
  return { response: start, authorizeUrl: new URL(start.headers.get("location")) };
}

async function login(origin) {
  const { authorizeUrl } = await beginLogin(origin);
  const callback = await fetch(`${origin}/auth/callback?code=test-code&state=${encodeURIComponent(authorizeUrl.searchParams.get("state"))}`, {
    redirect: "manual",
  });
  const code = new URL(callback.headers.get("location")).searchParams.get("review_code");
  const exchange = await fetch(`${origin}/auth/exchange`, {
    method: "POST",
    headers: { origin: siteOrigin, "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return exchange.json();
}

test("只接受允许站点并使用 state 与 PKCE 发起 GitHub 登录", async () => withGateway(async (origin) => {
  const badReturn = await fetch(`${origin}/auth/start?return_to=https://evil.example/`, { redirect: "manual" });
  assert.equal(badReturn.status, 400);
  const { response, authorizeUrl } = await beginLogin(origin);
  assert.equal(response.status, 302);
  assert.equal(authorizeUrl.origin, "https://github.com");
  assert.equal(authorizeUrl.pathname, "/login/oauth/authorize");
  assert.equal(authorizeUrl.searchParams.get("client_id"), "test-client-id");
  assert.equal(authorizeUrl.searchParams.get("redirect_uri"), "https://review.example.test/auth/callback");
  assert.equal(authorizeUrl.searchParams.get("code_challenge_method"), "S256");
  assert.equal(authorizeUrl.searchParams.get("code_challenge").length, 43);
  assert.equal(authorizeUrl.searchParams.has("scope"), false);
}));

test("拒绝伪造 state 和未授权的 GitHub 数字用户 ID", async () => withGateway(async (origin) => {
  const fakeState = await fetch(`${origin}/auth/callback?code=test-code&state=fake`, { redirect: "manual" });
  assert.equal(fakeState.status, 400);
  const { authorizeUrl } = await beginLogin(origin);
  const denied = await fetch(`${origin}/auth/callback?code=test-code&state=${authorizeUrl.searchParams.get("state")}`, { redirect: "manual" });
  assert.equal(denied.status, 403);
}, { allowedGithubIds: ["99999999"] }));

test("一次性授权码只能交换一次", async () => withGateway(async (origin) => {
  const { authorizeUrl } = await beginLogin(origin);
  const callback = await fetch(`${origin}/auth/callback?code=test-code&state=${authorizeUrl.searchParams.get("state")}`, { redirect: "manual" });
  const code = new URL(callback.headers.get("location")).searchParams.get("review_code");
  const request = () => fetch(`${origin}/auth/exchange`, {
    method: "POST",
    headers: { origin: siteOrigin, "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  assert.equal((await request()).status, 200);
  assert.equal((await request()).status, 400);
}));

test("短期令牌绑定 GitHub 身份并通过网关凭据转发", async () => withGateway(async (origin, calls) => {
  const session = await login(origin);
  assert.equal(session.email, "@energy-owner");
  const response = await fetch(`${origin}/reviews`, {
    method: "POST",
    headers: { origin: siteOrigin, authorization: `Bearer ${session.token}`, "content-type": "application/json" },
    body: JSON.stringify({ pagePath: "/energy-handbook/knowledge/energy-basics", actorEmail: "attacker@example.com" }),
  });
  assert.equal(response.status, 202);
  const n8nCall = calls.find(([url]) => url.startsWith("http://n8n.internal/"));
  assert.equal(n8nCall[1].headers["x-energy-review-gateway-token"], "gateway-test-token");
  assert.equal(JSON.parse(n8nCall[1].body).actorEmail, "github:energy-owner#12345678");
  const tokenCall = calls.find(([url]) => url.includes("oauth/access_token"));
  const tokenRequest = JSON.parse(tokenCall[1].body);
  assert.equal(tokenRequest.client_secret, "test-client-secret");
  assert.ok(tokenRequest.code_verifier.length >= 43);
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
