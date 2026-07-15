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

## 2026-07-15：自定义域名

- 正式站点域名确定为 `energybook.foxtiny.com`。
- GitHub Pages 已通过 API 登记该域名；子域名 DNS 应使用 CNAME 指向 `syrangg813s7vi-web.github.io`，不要包含仓库路径。
- `foxtiny.com` 使用 Cloudflare 权威 DNS。为便于 GitHub 完成域名校验和证书签发，初始记录采用 DNS only，证书就绪后再决定是否开启代理。
- 当前 Wrangler OAuth 会话只有 Zone 读取权限，没有 DNS 写入权限；需要在 Cloudflare 控制台登录后创建记录。

## 资料链接

- GitHub Pages 发布源：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- GitHub Pages 自定义工作流：<https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Zensical 兼容性：<https://zensical.org/compatibility/>
- Zensical 功能对齐：<https://zensical.org/compatibility/features/>
- Zensical 自定义 CSS/JavaScript：<https://zensical.org/docs/customization/>
- Material for MkDocs 维护模式说明：<https://squidfunk.github.io/mkdocs-material/blog/2025/11/11/insiders-now-free-for-everyone/>

## 2026-07-15：在线批阅与自动改稿架构

- 公开站点继续允许匿名阅读；登录只解锁划线批阅和任务状态，不影响搜索与动画。
- 登录入口采用 Cloudflare Access。Access 身份经过 n8n 验证后只签发一次性授权码；浏览器再换取短期批阅令牌，不保存 GitHub、ChatGPT 或长期服务密钥。
- 自托管 n8n 位于 `n8n.foxtiny.com`，实际主机为 SSH `molt`。该主机已安装 Codex CLI，并以 ChatGPT 账号登录；CLI 支持实验性的 `codex cloud exec/status/diff/apply`，因此可复用 Codex 套餐额度而无需 OpenAI API Key。
- n8n 现有 `Codex OAuth Chat` 自定义节点直接调用模型响应接口，不等价于云端 Codex 任务。本项目使用 Codex CLI 云端任务命令，保证任务可追踪且在绑定的 Cloud Environment 中执行。
- 默认自动修改白名单：`docs/**/*.md`、`docs/.vitepress/theme/components/**/*.{vue,ts,css}`、`docs/public/demos/**/*.{html,js,css,svg,json,csv}`。
- 默认拒绝 `.github/**`、依赖清单、VitePress 配置、服务器文件、符号链接、子模块和白名单外路径。动画代码还禁止外部脚本、动态执行、凭据读取和未经批准的网络请求。
- 自动合入采用临时分支与 PR；只有范围检查、安全检查和 VitePress 构建全部通过才启用自动合并，禁止执行器直接推送 `main`。
- `molt` 上的 Nginx 公开监听 80/443，n8n 本体只绑定 `127.0.0.1:5678`。由于源站仍可通过公网 IP + Host 访问，服务端必须验证 `Cf-Access-Jwt-Assertion` 的签名、受众和过期时间，不能只信任 Cloudflare 身份请求头。
- `molt` 已有 AI Workbench Codex Runner，绑定 Docker bridge `172.18.0.1:8787`，但它以 root、`danger-full-access` 和任意提示执行本地 Codex，不适合作为公开批阅执行器。能源批阅使用独立低权限用户、独立工作目录和严格参数接口。
- 用户要求由 Cloud Codex 提交代码。最终职责调整为：`molt` 只运行 `codex cloud exec/status`；Cloud Codex 通过绑定到 `energy-handbook` 的原生 GitHub 集成提交 `codex/review-*` 分支和 PR；仓库 Action 在 GitHub 内部重复策略与构建检查并启用 squash 自动合并。`molt` 不保存 GitHub 写入凭据，也不下载或应用任务差异。
- `energy-handbook` 的 Codex Cloud Environment 已创建并通过 `molt` 上的 Codex CLI 环境选择器核验。环境 ID 不进入公开仓库，部署时通过 `CODEX_CLOUD_ENV_ID` 注入独立执行器。
- `molt` 已部署 `energy-review-executor.service`：服务仅监听 n8n 所在 Docker 网桥 `172.18.0.1:8791`，只接受固定容器来源和 `x-review-executor-token`，进程使用无登录 shell 的 `energy-review` 系统账号。Codex 登录状态复制到该账号的 0700 私有目录，n8n 无法直接读取 ChatGPT 凭据或执行任意命令。
- n8n 2.19.5 已导入未发布工作流 `energy-handbook-review-api`，包含提交与状态查询两条 Webhook 路径、每个 HTTP 节点的错误输出和脱敏响应。两个 HTTP Request 节点已绑定 `x-review-executor-token` Header Auth 凭据。
- 通过 n8n 测试 Webhook 完成了不创建任务的穿透验证：请求到达隔离执行器，执行器的参数校验 400 被 n8n 脱敏并保持为 400；Codex Cloud 任务列表仍为空。
- n8n 2.19.5 的 HTTP Request 错误对象使用 `$json.error.status` 表示状态码，工作流表达式需要同时兼容 `error.status`、`error.httpCode` 和顶层 `httpCode`。
- 工作流发布仍需等待 Cloudflare Access 和公开会话网关完成；之后再经用户确认执行一次会真实创建 Codex Cloud 任务的端到端测试。
- Cloudflare 官方允许按路径保护自托管应用，但该账户所有 Cloudflare One 初始化路径都直接返回 `{}`。用户同意将身份层替换为 GitHub OAuth，n8n、Codex Cloud 和 GitHub 自动合并架构保持不变。
- 登录网关已改为 GitHub OAuth Web Flow：使用随机 `state` 防 CSRF、PKCE S256 保护授权码，不请求 OAuth scope；每次登录通过 `GET /user` 重新核验身份，并读取 `GET /repos/syrangg813s7vi-web/energy-handbook` 返回的当前用户权限，只有 `permissions.push=true`（含 maintain/admin）时放行。
- 一次性授权码使用后立即删除，批阅令牌用服务端 HMAC 签发并限制为 15 分钟；GitHub OAuth 临时访问令牌不写入浏览器、n8n 或磁盘。
- Cloudflare 账户当前尚未完成 Zero Trust 初始化：入口显示 “Welcome to Cloudflare Zero Trust / Get started”，进入 Cloudflare One 后持续 Loading。现有 Wrangler OAuth 仅有 account read、zone read 和 Workers 等权限，没有 Access 管理权限，无法用该令牌替代控制台初始化。
- GitHub OAuth App `Energy Handbook Review` 已创建，回调地址为 `https://n8n.foxtiny.com/energy-review/auth/callback`。客户端密钥只部署在 `molt:/etc/energy-review-gateway.env`，权限为 `root:energy-review 0640`，不进入仓库或 n8n 工作流。
- `energy-review-gateway.service` 已部署并绑定 `127.0.0.1:8790`；Nginx 将 `/energy-review/` 反向代理到该端口，同时对公网隐藏 `/webhook/energy-handbook/`。因此浏览器只能经过 GitHub OAuth、短期会话、来源限制和提交限流后的网关访问批阅链路。
- n8n 工作流已从 Cloudflare 身份头切换为网关写入的 `actorEmail`，并已发布激活。无效负载从 n8n 到隔离执行器的完整链路稳定返回脱敏 HTTP 400，不会创建 Cloud Codex 任务。
- 服务器上的 systemd `nginx.service` 存在既有 PrivateTmp mount namespace 故障，`systemctl reload nginx` 会返回 `226/NAMESPACE`；主进程本身正常，配置经 `nginx -t` 验证后可用 `nginx -s reload` 安全重载。
