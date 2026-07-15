#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import process from "node:process";
import {
  buildCloudPrompt,
  validateReviewPayload,
} from "./review-policy.mjs";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function parsePayload(encoded) {
  if (!/^[A-Za-z0-9+/=_-]+$/.test(encoded || "")) throw new Error("任务参数编码非法");
  if (encoded.length > 16_000) throw new Error("任务参数过长");
  return validateReviewPayload(JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")));
}

function parseTaskId(output) {
  const urlMatch = output.match(/\/tasks?\/([a-zA-Z0-9_-]{12,})/);
  if (urlMatch) return urlMatch[1];
  const matches = output.match(/\b[a-zA-Z0-9][a-zA-Z0-9_-]{11,}\b/g) || [];
  if (!matches.length) throw new Error(`无法从 Codex 输出识别任务 ID：${output.slice(0, 300)}`);
  return matches.at(-1);
}

function submit(encoded) {
  const payload = { ...parsePayload(encoded), requestId: randomUUID().replaceAll("-", "").slice(0, 12) };
  const environmentId = process.env.CODEX_CLOUD_ENV_ID;
  if (!environmentId) throw new Error("缺少 CODEX_CLOUD_ENV_ID");
  const output = run("codex", [
    "cloud", "exec", "--env", environmentId, "--branch", "main", buildCloudPrompt(payload),
  ]);
  return { jobId: parseTaskId(output), actorEmail: payload.actorEmail, output };
}

function status(taskId) {
  if (!/^[a-zA-Z0-9_-]{12,}$/.test(taskId || "")) throw new Error("任务 ID 非法");
  return { jobId: taskId, status: run("codex", ["cloud", "status", taskId]) };
}

try {
  const [command, argument] = process.argv.slice(2);
  let result;
  if (command === "submit") result = submit(argument);
  else if (command === "status") result = status(argument);
  else throw new Error("用法：review-runner.mjs <submit|status> <参数>");
  process.stdout.write(`${JSON.stringify({ ok: true, ...result })}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`);
  process.exitCode = 1;
}
