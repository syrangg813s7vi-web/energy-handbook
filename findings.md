# 发现与决策依据

## 2026-07-15：项目初始状态

- 工作区为空，当前是尚无提交的 `main` 分支。
- 工作区内没有 `AGENTS.md` 或既有项目约束。
- 用户明确要求：GitHub 托管、GitHub Pages 展示、Markdown 存储文本、HTML 动画演示。

## 初步架构判断

- 不建议把大段 `<style>` 和 `<script>` 直接复制到 Markdown；应该把动画实现放在统一的 JavaScript/CSS 组件中，Markdown 仅保留语义化标签及降级说明。
- 与 iframe 相比，简单动画优先用 Web Component：可共享站点样式、响应式更好、文章标记更简洁。需要强隔离或独立构建的大型模拟再使用 iframe。
- 候选技术底座为 MkDocs Material：以 Markdown 为中心，导航、搜索和主题成熟；使用 GitHub Actions 构建可避免受 GitHub Pages 原生 Jekyll 插件限制。

## 2026-07-15：官方文档核对

### GitHub Pages

- GitHub 官方的自定义 Actions 流程是：检出代码→构建静态文件→`actions/upload-pages-artifact`→`actions/deploy-pages`。
- 部署 job 至少需要 `pages: write` 和 `id-token: write`，并使用 `github-pages` environment。
- 自定义域名必须在仓库 Pages 设置或 API 中配置；只提交 `CNAME` 不会自动完成设置。

### MkDocs Material 与 Zensical

- Material for MkDocs 官方已说明项目进入维护模式，底层 MkDocs 1.x 的未来也存在不确定性。
- 同一团队开发的 Zensical 是 MkDocs + Material for MkDocs 的继任方案，支持 `mkdocs.yml`、MkDocs 目录结构、Python Markdown 方言、YAML front matter、自定义 CSS/JavaScript 和 HTML 模板。
- Zensical 官方兼容表已将本项目所需的核心能力标为可用，并明确宣称现有自定义 CSS/JavaScript 可保持兼容。
- Zensical 仍是 `0.0.x` 版本，存在变化风险；因此首版使用兼容的 `mkdocs.yml` 而不使用专有 `zensical.toml`，并锁定依赖版本。如需回退，内容和配置可直接转回 Material for MkDocs。
- PyPI 在 2026-07-15 返回的当前最新版本为 Zensical 0.0.50；项目已锁定该版本并成功完成本地构建。

## 技术选型结论

- 首选：Zensical + 兼容格式 `mkdocs.yml` + GitHub Pages artifact deployment。
- 动画：原生 Web Components + CSS，不引入前端框架；首个组件作为可访问性和复用模式的参考实现。
- 配置中加载 `.mjs` 模块和统一 CSS，文章中仅使用如 `<energy-flow-demo>` 的声明式标记。
- 回退方案：如 Zensical 在实际验证中不稳定，保留相同 `docs/` 和 `mkdocs.yml`，仅替换构建依赖和命令。

## 实施验证发现

- Zensical 0.0.50 生产构建通过，配置、Markdown 和内部链接未报错。
- 自定义标签需包在一个已知的块级 `<div>` 中，否则 Python Markdown 可能用 `<p>` 包裹未知标签，产生不理想的 HTML 嵌套。项目统一使用 `.animation-embed` 容器。
- 静态降级文字保留在自定义标签的 light DOM 中；组件定义后，Shadow DOM 替代其显示，避免调参后仍显示初始静态值。
- 构建结果在首页与嵌套页面中均使用正确的相对资源路径，适用于 GitHub 项目 Pages 的子路径部署。

## 2026-07-15：架构更新为 VitePress

- 用户在评估 EnergyResearch 中的 FBD/SFC 长文和独立 HTML 演示后，确认采用 VitePress。
- FBD/SFC 文章是标准 Markdown，仅嵌入 3 个 iframe；配套 HTML 基本自包含、已使用 sandbox 和降级链接，适合放入 VitePress `public/demos/plc/` 后原样嵌入。
- 最终动画分层：和文章深度联动的小型组件使用 Vue + TypeScript + SVG/CSS；大型、自包含、需要样式隔离的演示使用 Markdown + iframe HTML。
- 选择稳定版 VitePress 1.6.4，不采用 2.0 alpha。项目使用 Node.js 22 构建。
- VitePress 1.6.4 默认拉取 Vite 5.4.21，包含已公开的开发服务器漏洞。`package.json` 使用 npm override 锁定 Vite 6.4.3，它与 `@vitejs/plugin-vue` 5.x 的 peer dependency 范围兼容；生产构建通过，`npm audit` 为 0。
- VitePress 配置会根据 `GITHUB_REPOSITORY` 自动推导 Pages `base`：`<owner>.github.io` 仓库使用 `/`，普通项目仓库使用 `/<repository>/`。

## VitePress 资料链接

- VitePress 中的 Vue 与原始 HTML：<https://vitepress.dev/guide/using-vue>
- VitePress 静态资源和 `public`：<https://vitepress.dev/guide/asset-handling>
- VitePress GitHub Pages 部署：<https://vitepress.dev/guide/deploy>

## 2026-07-15：GitHub 仓库

- 公开仓库：<https://github.com/syrangg813s7vi-web/energy-handbook>
- 默认分支：`main`
- 本地 `origin`：`git@github.com:syrangg813s7vi-web/energy-handbook.git`

## 资料链接

- GitHub Pages 发布源：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- GitHub Pages 自定义工作流：<https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Zensical 兼容性：<https://zensical.org/compatibility/>
- Zensical 功能对齐：<https://zensical.org/compatibility/features/>
- Zensical 自定义 CSS/JavaScript：<https://zensical.org/docs/customization/>
- Material for MkDocs 维护模式说明：<https://squidfunk.github.io/mkdocs-material/blog/2025/11/11/insiders-now-free-for-everyone/>
