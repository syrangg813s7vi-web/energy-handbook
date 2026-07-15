import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCloudPrompt,
  isAllowedReviewPath,
  pagePathToMarkdown,
  validateReviewPayload,
} from "./review-policy.mjs";

const payload = {
  pagePath: "/energy-handbook/knowledge/energy-basics",
  pageTitle: "能量、功率与效率",
  text: "功率是能量随时间的变化率",
  before: "能量与功率。",
  after: "因此，一台设备。",
  instruction: "增加一个交互动画。",
  siteOrigin: "https://syrangg813s7vi-web.github.io",
  requestId: "abcd1234",
};

test("允许文章与动画路径", () => {
  assert.equal(isAllowedReviewPath("docs/knowledge/energy-basics.md"), true);
  assert.equal(isAllowedReviewPath("docs/.vitepress/theme/components/PowerDemo.vue"), true);
  assert.equal(isAllowedReviewPath("docs/public/demos/power.html"), true);
});

test("拒绝工作流、依赖和全局配置", () => {
  assert.equal(isAllowedReviewPath(".github/workflows/pages.yml"), false);
  assert.equal(isAllowedReviewPath("package.json"), false);
  assert.equal(isAllowedReviewPath("docs/.vitepress/config.mts"), false);
  assert.throws(() => isAllowedReviewPath("../outside.md"));
});

test("页面路由可靠映射到 Markdown", () => {
  assert.equal(pagePathToMarkdown(payload.pagePath), "docs/knowledge/energy-basics.md");
  assert.equal(pagePathToMarkdown("/energy-handbook/"), "docs/index.md");
});

test("验证批阅负载并构造受限提示", () => {
  const clean = validateReviewPayload(payload);
  const prompt = buildCloudPrompt(clean);
  assert.match(prompt, /docs\/knowledge\/energy-basics\.md/);
  assert.match(prompt, /增加一个交互动画/);
  assert.match(prompt, /不得修改 \.github/);
  assert.match(prompt, /codex\/review-abcd1234/);
});
