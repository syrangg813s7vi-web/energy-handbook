#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import {
  buildCloudPrompt,
  scanChangedFiles,
  validateReviewPayload,
} from "./review-policy.mjs";

const repository = "syrangg813s7vi-web/energy-handbook";

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
  const matches = output.match(/\b(?:task[_-])?[a-zA-Z0-9]{12,}\b/g) || [];
  if (!matches.length) throw new Error(`无法从 Codex 输出识别任务 ID：${output.slice(0, 300)}`);
  return matches.at(-1);
}

function submit(encoded) {
  const payload = parsePayload(encoded);
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

function applyTask(taskId) {
  if (!/^[a-zA-Z0-9_-]{12,}$/.test(taskId || "")) throw new Error("任务 ID 非法");
  const workspace = mkdtempSync(path.join(tmpdir(), "energy-review-"));
  const branch = `codex/review-${randomUUID().slice(0, 8)}`;
  try {
    run("git", ["clone", "--depth", "1", `https://github.com/${repository}.git`, workspace]);
    run("git", ["checkout", "-b", branch], { cwd: workspace });
    run("codex", ["cloud", "apply", taskId], { cwd: workspace });
    const changedFiles = run("git", ["diff", "--name-only", "--diff-filter=ACMRT"], { cwd: workspace })
      .split("\n").filter(Boolean);
    const allChanged = run("git", ["diff", "--name-only"], { cwd: workspace }).split("\n").filter(Boolean);
    if (!changedFiles.length) throw new Error("云端任务没有产生修改");
    if (changedFiles.length !== allChanged.length) throw new Error("修改包含删除或不允许的文件状态");
    const violations = scanChangedFiles(workspace, changedFiles);
    if (violations.length) throw new Error(`安全检查失败：\n${violations.join("\n")}`);
    run("npm", ["ci"], { cwd: workspace });
    run("npm", ["run", "check"], { cwd: workspace });
    run("git", ["add", "--", ...changedFiles], { cwd: workspace });
    run("git", ["commit", "-m", `docs: apply online review ${taskId}`], { cwd: workspace });
    run("git", ["push", "--set-upstream", "origin", branch], { cwd: workspace });
    const prUrl = run("gh", [
      "pr", "create", "--repo", repository, "--base", "main", "--head", branch,
      "--title", `在线批阅：${taskId}`,
      "--body", `由登录批阅任务 \`${taskId}\` 自动生成。文件范围、安全规则和 VitePress 构建已通过。`,
    ], { cwd: workspace });
    run("gh", ["pr", "merge", prUrl, "--repo", repository, "--auto", "--squash", "--delete-branch"], { cwd: workspace });
    return { jobId: taskId, branch, prUrl, state: "merge_queued" };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

try {
  const [command, argument] = process.argv.slice(2);
  let result;
  if (command === "submit") result = submit(argument);
  else if (command === "status") result = status(argument);
  else if (command === "apply") result = applyTask(argument);
  else throw new Error("用法：review-runner.mjs <submit|status|apply> <参数>");
  process.stdout.write(`${JSON.stringify({ ok: true, ...result })}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`);
  process.exitCode = 1;
}
