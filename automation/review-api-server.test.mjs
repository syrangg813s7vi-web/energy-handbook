import assert from "node:assert/strict";
import test from "node:test";
import { createReviewServer } from "./review-api-server.mjs";

const validPayload = {
  pagePath: "/energy-handbook/knowledge/energy-basics",
  pageTitle: "能量、功率与效率",
  text: "功率是能量随时间的变化率",
  before: "能量与功率。",
  after: "因此，一台设备。",
  instruction: "补充一句通俗解释。",
  siteOrigin: "https://syrangg813s7vi-web.github.io",
  actorEmail: "reviewer@example.com",
};

async function withServer(run) {
  const calls = [];
  const server = createReviewServer({
    token: "test-token",
    allowedAddresses: new Set(["127.0.0.1"]),
    runRunner: async (command, argument) => {
      calls.push([command, argument]);
      return command === "submit"
        ? { ok: true, jobId: "task_abcdefghijkl" }
        : { ok: true, jobId: argument, status: "ready" };
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`, calls);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("拒绝缺少内部凭据的请求", async () => withServer(async (origin) => {
  const response = await fetch(`${origin}/v1/reviews/submit`, { method: "POST", body: JSON.stringify(validPayload) });
  assert.equal(response.status, 401);
}));

test("在调用执行器前验证批阅负载", async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/v1/reviews/submit`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-review-executor-token": "test-token" },
    body: JSON.stringify({ ...validPayload, instruction: "" }),
  });
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
}));

test("提交任务时只向外返回任务标识", async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/v1/reviews/submit`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-review-executor-token": "test-token" },
    body: JSON.stringify(validPayload),
  });
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.jobId, "task_abcdefghijkl");
  assert.equal(calls[0][0], "submit");
}));

test("整批批注只提交一个执行器任务", async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/v1/reviews/submit`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-review-executor-token": "test-token" },
    body: JSON.stringify({
      siteOrigin: validPayload.siteOrigin,
      actorEmail: validPayload.actorEmail,
      items: [validPayload, { ...validPayload, text: "效率等于有用输出除以输入", instruction: "补充公式。" }],
    }),
  });
  assert.equal(response.status, 202);
  assert.equal(calls.length, 1);
  const forwarded = JSON.parse(Buffer.from(calls[0][1], "base64url").toString("utf8"));
  assert.equal(forwarded.items.length, 2);
}));

test("仅接受格式正确的任务标识查询状态", async () => withServer(async (origin) => {
  const headers = { "x-review-executor-token": "test-token" };
  const response = await fetch(`${origin}/v1/reviews/status/task_abcdefghijkl`, { headers });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "ready");
  const invalid = await fetch(`${origin}/v1/reviews/status/bad`, { headers });
  assert.equal(invalid.status, 404);
}));
