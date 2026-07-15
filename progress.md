# 建设进度日志

## 2026-07-15

### 已完成

- 读取并启用 `planning-with-files` 工作流。
- 运行会话恢复检查，未发现需同步的历史上下文。
- 检查工作区和 Git 状态：空仓库，`main` 分支，尚无提交。
- 建立 `task_plan.md`、`findings.md` 和 `progress.md`。
- 核对 GitHub Pages、Material for MkDocs 和 Zensical 官方文档，选择 Zensical + MkDocs 兼容配置。
- 创建站点配置、首页、能源基础示例、路线图和动画编写指南。
- 实现可复用 `<energy-flow-demo>` Web Component，支持参数调节、实时输出、键盘控件、辅助技术状态和减弱动画偏好。
- 创建 GitHub Pages artifact 构建/部署工作流，PR 只构建，`main` 推送构建后部署。
- 用 Playwright 完成桌面端可访问性快照、滑块交互和 390 px 移动端视觉检查。
- 根据用户决策将底座从 Zensical 迁移到 VitePress 1.6.4。
- 将能量流 Web Component 改写为 SSR 友好的 Vue 3 + TypeScript 组件。
- 建立 `docs/public/demos/` 独立 HTML 演示目录、iframe 模板与验收要求。
- 更新首页、中文导航、本地搜索、主题、说明文档和 GitHub Pages 工作流。
- 将 Vite 安全覆盖到 6.4.3，`npm audit` 从 3 项风险降为 0。
- 创建 GitHub 公开仓库 `syrangg813s7vi-web/energy-handbook`，完成首次提交并推送 `main`。
- 启用 GitHub Pages Actions 发布源，首次构建与部署通过，在线首页返回 HTTP 200。
- 在 GitHub Pages 登记自定义域名 `energybook.foxtiny.com`，并完成 VitePress 根路径、canonical、sitemap 与 `CNAME` 文件配置。

### 正在进行

- 实现公开站点登录后解锁的划线批阅功能。
- 建立 `n8n.foxtiny.com` → Codex Cloud → GitHub 自动改稿与合并链路。
- 进入阶段 2：完善分类法、内容模板、引用规范和贡献流程。
- 在 Cloudflare 为 `energybook.foxtiny.com` 添加指向 `syrangg813s7vi-web.github.io` 的 DNS-only CNAME，并等待 GitHub 签发 HTTPS 证书。

### 在线批阅决策

- 用户确认使用同一公开网站：匿名访问只读，Cloudflare Access 登录后解锁批阅。
- 用户确认自动修改、自动 PR 和检查通过后自动合并。
- 用户确认改稿范围包含 Markdown 文章与动画代码。
- 已验证 SSH `molt` 上运行 n8n，Codex CLI 0.133.0 已安装且 root 账号使用 ChatGPT 登录；云端任务命令可用。
- 已完成 VitePress 登录态、批阅模式、文字划选、选区高亮、浮动操作按钮和修改要求抽屉。
- 已通过真实浏览器验证划选与抽屉交互；测试使用临时会话，未调用真实服务端。
- 已实现批阅负载验证、页面到 Markdown 的路由映射、文章/动画文件白名单和动画静态安全扫描。
- 已按用户最新要求将执行器收窄为 Codex Cloud 任务提交与状态查询；代码提交和 PR 由 Cloud Codex 的原生 GitHub 集成完成，`molt` 不再应用差异或保存 GitHub 写入凭据。
- 已在 Codex Web 为 `syrangg813s7vi-web/energy-handbook` 创建唯一 Cloud Environment；重复环境已删除，环境 ID 将只作为 `molt` 的部署变量保存，不写入公开仓库。
- 已确认 `molt` 现有研究 Runner 使用 root + `danger-full-access`，能源批阅不会复用；将建立独立低权限服务。

### 验证记录

| 检查 | 结果 | 备注 |
|---|---|---|
| 会话恢复 | 通过 | 无未同步内容 |
| Git 状态 | 通过 | 空仓库，无需保护的既有改动 |
| Zensical 0.0.50 安装 | 通过 | Python 3.14.6 本地虚拟环境 |
| `zensical build --clean` | 通过 | 无配置、内容或链接问题 |
| JavaScript 语法检查 | 通过 | `node --check` |
| 桌面端页面与控制台 | 通过 | 组件已定义，无脚本错误 |
| 滑块交互 | 通过 | 2,000 W × 60% = 1,200 W，损失 800 W |
| 390 × 844 移动端 | 通过 | 控件、图形和文字无溢出 |
| 静态降级内容 | 通过 | 未定义组件时显示，组件启用后不重复显示 |
| VitePress 1.6.4 生产构建 | 通过 | Node.js 22.22.2，Vite 6.4.3 |
| `npm audit` | 通过 | 0 vulnerabilities |
| Vue 组件 SSR/激活 | 通过 | 首屏有内容，滑块可交互 |
| VitePress 中文本地搜索 | 通过 | “效率”可命中基础文章和首页等内容 |
| VitePress 390 × 844 移动端 | 通过 | 能量流组件无溢出，文字与控件可读 |
| GitHub Pages 首次发布 | 通过 | <https://syrangg813s7vi-web.github.io/energy-handbook/> 返回 HTTP 200 |
| 在线批阅前端生产构建 | 通过 | 未配置 API 时入口隐藏，SSR 构建正常 |
| 在线批阅浏览器交互 | 通过 | 登录态、开启批阅、正文划选、浮动按钮、抽屉焦点和提交按钮状态正常 |
| 批阅策略单元测试 | 通过 | 4 项测试：允许范围、禁止范围、路由映射、受限提示词 |
| Codex Cloud Environment | 通过 | 浏览器端仅保留 1 个 `energy-handbook` 环境；`molt` 上 Codex CLI 可识别 |
