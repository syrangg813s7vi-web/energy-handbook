import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";

const allowedAnimationExtensions = new Set([
  ".vue", ".ts", ".css", ".html", ".js", ".svg", ".json", ".csv",
]);

const forbiddenCodePatterns = [
  { pattern: /\beval\s*\(/, reason: "禁止 eval" },
  { pattern: /\bnew\s+Function\s*\(/, reason: "禁止动态 Function" },
  { pattern: /document\.cookie/, reason: "禁止读取 Cookie" },
  { pattern: /\b(?:localStorage|sessionStorage)\b/, reason: "禁止读取浏览器存储" },
  { pattern: /\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/, reason: "禁止未经批准的网络请求" },
  { pattern: /<script\b[^>]*\bsrc\s*=/i, reason: "禁止外部脚本" },
  { pattern: /\bimport\s*\(\s*["']https?:\/\//, reason: "禁止远程动态导入" },
];

export function normalizeRepositoryPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new Error(`非法仓库路径：${filePath}`);
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => segment === ".." || segment === "." || segment === "")) {
    throw new Error(`仓库路径越界：${filePath}`);
  }
  return normalized;
}

export function isAllowedReviewPath(filePath) {
  const normalized = normalizeRepositoryPath(filePath);
  if (/^docs\/(?!\.vitepress\/).*\.md$/i.test(normalized)) return true;
  if (/^docs\/\.vitepress\/theme\/components\//.test(normalized)) {
    return new Set([".vue", ".ts", ".css"]).has(path.extname(normalized).toLowerCase());
  }
  if (/^docs\/public\/demos\//.test(normalized)) {
    return allowedAnimationExtensions.has(path.extname(normalized).toLowerCase());
  }
  return false;
}

export function validateReviewPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("请求必须是 JSON 对象");
  const payload = value;
  const required = ["pagePath", "pageTitle", "text", "before", "after", "instruction", "siteOrigin"];
  for (const key of required) {
    if (typeof payload[key] !== "string") throw new Error(`${key} 必须是字符串`);
  }
  if (payload.text.trim().length < 2 || payload.text.length > 2_000) throw new Error("选区长度必须为 2–2000 字符");
  if (payload.instruction.trim().length < 2 || payload.instruction.length > 2_000) throw new Error("修改要求长度必须为 2–2000 字符");
  if (payload.before.length > 500 || payload.after.length > 500) throw new Error("上下文过长");
  if (!payload.pagePath.startsWith("/") || payload.pagePath.includes("..")) throw new Error("页面路径非法");
  if (!new Set([
    "https://syrangg813s7vi-web.github.io",
    "http://127.0.0.1:4173",
  ]).has(payload.siteOrigin)) throw new Error("站点来源不在白名单内");
  return {
    pagePath: payload.pagePath,
    pageTitle: payload.pageTitle.slice(0, 200),
    text: payload.text.trim(),
    before: payload.before,
    after: payload.after,
    instruction: payload.instruction.trim(),
    siteOrigin: payload.siteOrigin,
    actorEmail: typeof payload.actorEmail === "string" ? payload.actorEmail.slice(0, 254) : "",
  };
}

export function pagePathToMarkdown(pagePath) {
  let pathname = pagePath.split(/[?#]/, 1)[0];
  pathname = pathname.replace(/^\/energy-handbook(?=\/|$)/, "") || "/";
  if (pathname === "/") return "docs/index.md";
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const candidate = normalizeRepositoryPath(`docs/${clean}.md`);
  if (!isAllowedReviewPath(candidate)) throw new Error("页面不对应允许修改的 Markdown 文件");
  return candidate;
}

export function scanChangedFiles(repositoryRoot, changedFiles) {
  const violations = [];
  for (const rawFile of changedFiles) {
    let file;
    try {
      file = normalizeRepositoryPath(rawFile);
    } catch (error) {
      violations.push(error.message);
      continue;
    }
    if (!isAllowedReviewPath(file)) {
      violations.push(`文件不在白名单：${file}`);
      continue;
    }
    const absolutePath = path.join(repositoryRoot, file);
    let stat;
    try {
      stat = lstatSync(absolutePath);
    } catch {
      violations.push(`禁止删除文件：${file}`);
      continue;
    }
    if (stat.isSymbolicLink()) {
      violations.push(`禁止符号链接：${file}`);
      continue;
    }
    const extension = path.extname(file).toLowerCase();
    if (file.startsWith("docs/public/demos/") || file.startsWith("docs/.vitepress/theme/components/")) {
      if (new Set([".vue", ".ts", ".js", ".html", ".svg"]).has(extension)) {
        const content = readFileSync(absolutePath, "utf8");
        for (const rule of forbiddenCodePatterns) {
          if (rule.pattern.test(content)) violations.push(`${file}：${rule.reason}`);
        }
      }
    }
  }
  return violations;
}

export function buildCloudPrompt(payload) {
  const sourceFile = pagePathToMarkdown(payload.pagePath);
  return [
    "你正在维护 energy-handbook 能源知识库。请完成一条经过授权的在线批阅。",
    `目标文章：${sourceFile}`,
    `页面标题：${payload.pageTitle}`,
    `划选原文：${JSON.stringify(payload.text)}`,
    `前文上下文：${JSON.stringify(payload.before)}`,
    `后文上下文：${JSON.stringify(payload.after)}`,
    `修改要求：${payload.instruction}`,
    "先确认划选原文在目标 Markdown 中能够唯一、可靠地定位，再修改。",
    "可以按需修改文章 Markdown、VitePress 动画组件或 public/demos 下的动画。",
    "不得修改 .github、依赖文件、VitePress 全局配置或白名单外文件，不得新增依赖。",
    "动画必须自包含、支持移动端和减弱动画偏好，不得加入外部脚本、凭据访问或网络请求。",
    "完成后运行 npm run check。不要提交、推送或创建 PR；外部执行器会处理这些步骤。",
  ].join("\n");
}
