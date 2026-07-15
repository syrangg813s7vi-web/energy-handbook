#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import process from "node:process";
import { scanChangedFiles } from "./review-policy.mjs";

const base = process.argv[2] || "origin/main";
const head = process.argv[3] || "HEAD";
const cwd = process.cwd();

function git(args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }).trim();
}

try {
  const range = `${base}...${head}`;
  const allChanged = git(["diff", "--name-only", range]).split("\n").filter(Boolean);
  const acceptedStates = git(["diff", "--name-only", "--diff-filter=ACMRT", range]).split("\n").filter(Boolean);
  if (!allChanged.length) throw new Error("批阅分支没有文件修改");
  if (allChanged.length !== acceptedStates.length) throw new Error("批阅分支包含文件删除或禁止的状态变化");
  const violations = scanChangedFiles(cwd, allChanged);
  if (violations.length) throw new Error(violations.join("\n"));
  process.stdout.write(`批阅安全检查通过：${allChanged.join(", ")}\n`);
} catch (error) {
  process.stderr.write(`批阅安全检查失败：${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
