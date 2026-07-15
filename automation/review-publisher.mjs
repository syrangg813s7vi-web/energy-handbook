#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const taskPattern = /^task_[A-Za-z0-9_-]{12,}$/;
const branchPattern = /^codex\/review-[a-z0-9]{12}$/;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: Number(process.env.REVIEW_PUBLISH_COMMAND_TIMEOUT_MS || 20 * 60 * 1000),
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

export function parseCloudState(output) {
  const match = String(output || "").match(/^\[([A-Z_]+)\]/m);
  return match?.[1]?.toLowerCase() || "unknown";
}

function validateJob(value) {
  if (!value || typeof value !== "object") throw new Error("任务记录必须是对象");
  if (!taskPattern.test(value.jobId || "")) throw new Error("任务记录包含非法 jobId");
  if (!branchPattern.test(value.branch || "")) throw new Error("任务记录包含非法分支");
  if (value.branch !== `codex/review-${value.requestId}`) throw new Error("任务分支与 requestId 不一致");
  return value;
}

function writeJob(jobsDirectory, job) {
  const destination = path.join(jobsDirectory, `${job.jobId}.json`);
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(job, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, destination);
}

function updateJob(jobsDirectory, job, values) {
  Object.assign(job, values, { updatedAt: new Date().toISOString() });
  writeJob(jobsDirectory, job);
}

function gitEnvironment() {
  const deployKey = process.env.REVIEW_GIT_DEPLOY_KEY || "/var/lib/energy-review/.ssh/energy-handbook";
  const knownHosts = process.env.REVIEW_GIT_KNOWN_HOSTS || "/var/lib/energy-review/.ssh/known_hosts";
  return {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${deployKey} -o IdentitiesOnly=yes -o UserKnownHostsFile=${knownHosts} -o StrictHostKeyChecking=yes`,
  };
}

export function publishJob(job, options = {}) {
  validateJob(job);
  const jobsDirectory = options.jobsDirectory || process.env.REVIEW_JOBS_DIRECTORY || "/var/lib/energy-review/jobs";
  const workspacesDirectory = options.workspacesDirectory
    || process.env.REVIEW_WORKSPACES_DIRECTORY
    || "/var/lib/energy-review/workspaces";
  const repository = process.env.REVIEW_GIT_REPOSITORY || "git@github.com:syrangg813s7vi-web/energy-handbook.git";
  const command = options.run || run;
  const workspace = path.join(workspacesDirectory, job.jobId);
  const repositoryRoot = path.join(workspace, "repository");
  const env = options.env || gitEnvironment();

  mkdirSync(jobsDirectory, { recursive: true, mode: 0o700 });
  rmSync(workspace, { recursive: true, force: true });
  mkdirSync(workspace, { recursive: true, mode: 0o700 });
  updateJob(jobsDirectory, job, { state: "publishing", error: "" });

  command("git", ["clone", "--no-tags", repository, repositoryRoot], { env });
  command("git", ["checkout", "-b", job.branch, "origin/main"], { cwd: repositoryRoot, env });
  command(process.env.CODEX_BIN || "codex", ["cloud", "apply", job.jobId], { cwd: repositoryRoot, env });

  const changedFiles = command("git", ["diff", "--name-only", "HEAD"], { cwd: repositoryRoot, env })
    .split("\n").filter(Boolean);
  if (!changedFiles.length) throw new Error("Cloud 任务没有可发布的文件修改");

  command("git", ["config", "user.name", "Energy Handbook Review"], { cwd: repositoryRoot, env });
  command("git", ["config", "user.email", "energy-handbook-review@users.noreply.github.com"], { cwd: repositoryRoot, env });
  command("git", ["add", "--", ...changedFiles], { cwd: repositoryRoot, env });
  command("git", ["commit", "-m", `在线批阅：${job.requestId}`], { cwd: repositoryRoot, env });
  command(process.execPath, ["automation/validate-review-diff.mjs", "origin/main", "HEAD"], { cwd: repositoryRoot, env });
  command("git", ["push", "origin", `HEAD:refs/heads/${job.branch}`], { cwd: repositoryRoot, env });

  updateJob(jobsDirectory, job, { state: "pushed", pushedAt: new Date().toISOString(), changedFiles });
  rmSync(workspace, { recursive: true, force: true });
  return job;
}

export function processJobFile(filePath, options = {}) {
  const jobsDirectory = options.jobsDirectory || path.dirname(filePath);
  const job = validateJob(JSON.parse(readFileSync(filePath, "utf8")));
  if (["pushed", "failed"].includes(job.state)) return job;
  try {
    const statusOutput = (options.run || run)(process.env.CODEX_BIN || "codex", ["cloud", "status", job.jobId]);
    const cloudState = parseCloudState(statusOutput);
    updateJob(jobsDirectory, job, { cloudState });
    if (cloudState === "ready") return publishJob(job, { ...options, jobsDirectory });
    if (["failed", "error", "cancelled", "canceled"].includes(cloudState)) {
      updateJob(jobsDirectory, job, { state: "failed", error: `Cloud 任务状态：${cloudState}` });
    }
    return job;
  } catch (error) {
    const attempts = Number(job.publishAttempts || 0) + 1;
    updateJob(jobsDirectory, job, {
      state: attempts >= 3 ? "failed" : "retrying",
      publishAttempts: attempts,
      error: error instanceof Error ? error.message.slice(0, 1000) : String(error).slice(0, 1000),
    });
    return job;
  }
}

export function processPendingJobs(options = {}) {
  const jobsDirectory = options.jobsDirectory || process.env.REVIEW_JOBS_DIRECTORY || "/var/lib/energy-review/jobs";
  mkdirSync(jobsDirectory, { recursive: true, mode: 0o700 });
  for (const name of readdirSync(jobsDirectory).filter((entry) => entry.endsWith(".json") && taskPattern.test(entry.slice(0, -5)))) {
    processJobFile(path.join(jobsDirectory, name), { ...options, jobsDirectory });
  }
}

async function main() {
  if (process.argv.includes("--once")) {
    processPendingJobs();
    return;
  }
  const intervalMs = Number(process.env.REVIEW_PUBLISH_INTERVAL_MS || 30_000);
  for (;;) {
    processPendingJobs();
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
