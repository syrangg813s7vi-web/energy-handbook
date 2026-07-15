import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { parseCloudState, processJobFile, publishJob } from "./review-publisher.mjs";

test("parses Codex Cloud task states", () => {
  assert.equal(parseCloudState("[READY] Implement review\nrepo • now"), "ready");
  assert.equal(parseCloudState("[IN_PROGRESS] Working"), "in_progress");
  assert.equal(parseCloudState("unexpected"), "unknown");
});

test("keeps non-ready jobs queued without publishing", () => {
  const jobsDirectory = mkdtempSync(path.join(tmpdir(), "energy-review-jobs-"));
  const job = {
    jobId: "task_abcdefghijklmnop",
    requestId: "123456789abc",
    branch: "codex/review-123456789abc",
    state: "submitted",
  };
  const filePath = path.join(jobsDirectory, `${job.jobId}.json`);
  writeFileSync(filePath, JSON.stringify(job));
  processJobFile(filePath, {
    jobsDirectory,
    run: () => "[IN_PROGRESS] Working",
  });
  const stored = JSON.parse(readFileSync(filePath, "utf8"));
  assert.equal(stored.state, "submitted");
  assert.equal(stored.cloudState, "in_progress");
});

test("rejects a branch not derived from the request id", () => {
  const jobsDirectory = mkdtempSync(path.join(tmpdir(), "energy-review-jobs-"));
  const filePath = path.join(jobsDirectory, "task_abcdefghijklmnop.json");
  writeFileSync(filePath, JSON.stringify({
    jobId: "task_abcdefghijklmnop",
    requestId: "123456789abc",
    branch: "codex/review-aaaaaaaaaaaa",
    state: "submitted",
  }));
  assert.throws(() => processJobFile(filePath, { jobsDirectory, run: () => "[READY] Done" }), /不一致/);
});

test("publishes only the derived review branch after the local policy gate", () => {
  const root = mkdtempSync(path.join(tmpdir(), "energy-review-publish-"));
  const jobsDirectory = path.join(root, "jobs");
  const workspacesDirectory = path.join(root, "workspaces");
  const job = {
    jobId: "task_abcdefghijklmnop",
    requestId: "123456789abc",
    branch: "codex/review-123456789abc",
    state: "submitted",
  };
  const commands = [];
  const fakeRun = (command, args) => {
    commands.push([command, ...args]);
    return command === "git" && args[0] === "diff" ? "docs/knowledge/example.md" : "";
  };

  publishJob(job, { jobsDirectory, workspacesDirectory, run: fakeRun, env: {} });

  assert.ok(commands.some((parts) => parts.includes("automation/validate-review-diff.mjs")));
  assert.ok(commands.some((parts) => parts.at(-1) === "HEAD:refs/heads/codex/review-123456789abc"));
  assert.ok(!commands.some((parts) => parts.at(-1) === "HEAD:refs/heads/main"));
  const stored = JSON.parse(readFileSync(path.join(jobsDirectory, `${job.jobId}.json`), "utf8"));
  assert.equal(stored.state, "pushed");
});
