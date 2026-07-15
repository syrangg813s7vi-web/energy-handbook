# 能源知识库建设计划

## 总体目标

建设一个托管在 GitHub、通过 GitHub Pages 公开展示的中文能源知识库。内容以 Markdown 为单一信息源，支持搜索、导航、引用、图表和可复用交互动画，并具备清晰的编辑、审核和发布流程。

## 建设原则

- Markdown 优先：文本离线可读、方便 diff 和审核。
- 素材与内容分离：动画、样式、数据文件集中管理，文章只声明如何使用。
- 渐进增强：动画失效时仍有文字、图片或表格可读。
- 证据可追溯：重要结论标注来源、发布时间、统计口径和访问日期。
- 先建小而稳定的底座，再扩展内容、数据和可视化。

## 阶段

### 阶段 1：架构与可运行底座 `complete`

- [x] 检查工作区、Git 状态和现有约束
- [x] 创建持久化计划、发现和进度文件
- [x] 核对当前 GitHub Pages 和静态站点生成器的官方部署方式
- [x] 完成技术选型与目录规范
- [x] 搭建首页、导航、示例文章和可复用动画
- [x] 配置本地构建、基础质量检查和 GitHub Pages 发布
- [x] 验证构建产物与关键页面

### 阶段 1.1：迁移到 VitePress `complete`

- [x] 核对 VitePress 对 Markdown、Vue 组件、原始 HTML、静态资源和 GitHub Pages 的官方支持
- [x] 将站点配置、主题、导航和搜索迁移到 VitePress 1.6.4
- [x] 将能量流 Web Component 迁移为 SSR 友好的 Vue 组件
- [x] 建立 `public/demos/` 独立 HTML 动画规范
- [x] 更新 GitHub Pages 工作流并验证生产构建与页面

### 阶段 2：内容体系与编写规范 `in_progress`

- [ ] 定义能源领域分类法、标签和文章模板
- [ ] 定义引用、数据口径、图表和术语表规范
- [x] 建立交互动画编写与验收规范初稿
- [ ] 建立贡献指南、审核清单和 issue/PR 模板
- [ ] 确定首批主题及负责人

### 阶段 2.1：在线登录、批阅与自动改稿 `in_progress`

- [x] 确定公开阅读、登录后批阅的产品形态
- [x] 确定自托管 n8n → Codex Cloud → GitHub 的执行架构
- [x] 定义文章与动画代码的修改白名单
- [x] 在 VitePress 中加入登录状态、文字划选和批阅面板
- [ ] 建立 Cloudflare Access 登录与短期会话交换
- [x] 建立 n8n 批阅接收、任务追踪和错误处理工作流（已验证，待身份网关完成后发布）
- [x] 在 `molt` 建立低权限 Codex Cloud 执行器
- [x] 加入文件范围、安全扫描和构建门禁代码
- [ ] 接通临时分支、PR 与自动合并门禁
- [ ] 完成端到端验证并发布

### 阶段 3：核心知识与数据可视化 `pending`

- [ ] 编写能源基础、电力系统、化石能源、可再生能源、储能等核心内容
- [ ] 建立可复用动画与图表组件库
- [ ] 为每个可视化提供数据来源和无 JS 降级内容

### 阶段 4：质量、发布与运营 `pending`

- [ ] 加入链接、Markdown、可访问性和构建检查
- [x] 完成 GitHub Pages 首次发布：<https://syrangg813s7vi-web.github.io/energy-handbook/>
- [ ] 完成自定义域名 `energybook.foxtiny.com`（GitHub 已登记，等待 Cloudflare DNS 与 HTTPS 证书）
- [ ] 建立版本、更新频率、数据时效性和反馈机制

## 当前关键决策

| 决策 | 状态 | 说明 |
|---|---|---|
| Markdown 作为主要内容源 | 已确定 | 易于维护、审核和迁移 |
| 动画实现 | 已更新 | 页内高交互组件使用 Vue + SVG/CSS；大型自包含演示使用 `public/demos/` HTML + iframe |
| 静态站点生成器 | 已确定 | VitePress 1.6.4 + Vue 3 + Vite 6.4.3 |
| 在线批阅身份 | 已确定 | 公开可读；Cloudflare Access 登录后才显示并允许批阅 |
| 自动改稿执行 | 已确定 | `n8n.foxtiny.com`（SSH `molt`）提交 `codex cloud` 任务，检查后自动 PR/合并 |
| 默认修改边界 | 已确定 | Markdown、VitePress 动画组件及 `public/demos`；禁止工作流、依赖和站点配置 |

## 待用户确认（不阻塞底座建设）

- [x] GitHub 归属与仓库：`syrangg813s7vi-web/energy-handbook`
- [x] 自定义域名：`energybook.foxtiny.com`
- 首批优先内容和主要读者（公众、学生、从业者或研究人员）
- 许可证选择（初始建议文本 CC BY 4.0，代码 MIT）

## 错误记录

| 日期 | 错误 | 尝试 | 解决方案 |
|---|---|---:|---|
| 2026-07-15 | Playwright `fill` 将纯数字参数解析为 number，而命令要求 string | 1 | 改用元素级 `eval` 设置 range 值并派发原生 `input` 事件 |
| 2026-07-15 | VitePress 1.6.4 默认依赖 Vite 5.4.21，`npm audit` 报告 3 项开发服务器漏洞 | 1 | 通过 npm `overrides` 升级到与 Vue 插件兼容的 Vite 6.4.3，构建通过且审计归零 |
| 2026-07-15 | 专用执行器以低权限账号启动时 systemd 返回 `203/EXEC` | 1 | `/usr/local/bin/node` 实际指向不可穿越的 `/root/.nvm`；将 Node 二进制复制到受保护的 `/opt/energy-review-executor/bin` 并改用该路径 |
| 2026-07-15 | n8n 无副作用 Webhook 测试返回 `ERR_INVALID_HTTP_TOKEN` | 1 | Header Auth 的 Name 字段误填为带空格的凭据名称；改为合法 Header 名 `x-review-executor-token`，并用无换行方式重贴令牌 |
| 2026-07-15 | 执行器正确返回 400，但 n8n 脱敏响应误映射为 502 | 1 | n8n 2.19.5 的 HTTP Request 错误状态位于 `$json.error.status`；响应表达式增加该字段并保留旧版兼容回退 |
