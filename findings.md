# 发现与决策依据

## 2026-07-23：IEC 104设计初衷概要文章

- 目标读者需要先建立业务视角和协议视角，不从 TypeID、常量或位定义开始。
- 正文只保留三个业务问题：及时看见现场、断线后恢复可信状态、让远方控制结果可追踪。
- Modbus 对比限定为典型使用方式：Modbus 更接近主站轮询寄存器/线圈，IEC 104面向广域远动、主动事件、状态恢复和控制事务；避免写成“Modbus 永远不能主动”之类的绝对结论。
- 动画只承担一个教学任务：用同一个断路器变位场景对比轮询发现与主动上送，并补一段断线后总召恢复；不加入协议字段教学和装饰性动效。
- 发布遵循现有原版图形策略：独立 HTML 进入 `docs/public/demos/iec104/`，文章只通过 iframe 引用，并保留文字结论。

## 2026-07-23：能源控制器知识全景发布

- 当前研究仓库已经形成结构化理解的强项包括：多厂家 Modbus 点表与版本风险、IEC 61850 信息模型、OpenEMS 实时运行时、IEC 61131-3/FBD/SFC、状态机与安全联锁、柴发控制器、车桩协议、SPPC/MGCC/PMS/EMS 分层和边云协同。
- 评估采用证据等级而不是自评分数：“已了解”要求能够结构化解释、写成文章或解读实现；“正在建立”表示已有概念或资料但缺工程闭环；“需要补齐”表示尚缺系统产物或实作证据。
- 全景共 7 层、29 个模块，其中 8 个已了解、11 个正在建立、10 个需要补齐。模块颗粒度不同，计数只用于观察知识结构。
- 当前最大的能力断层不是资料数量，而是尚缺一个自己实现、可测试、可故障注入、可恢复的 Edge EMS Controller 垂直切片。
- 根据站点全局规则，Codex 当前生成的全景图应作为图形权威源直接版本化嵌入，不在 Vue 中重新绘制近似版。
- Linear 新事项因工作区免费版 issue 上限无法创建；仓库计划文件暂时承担该功能的范围、验收、回滚和状态记录。
- 站点现有大型可视化采用 `docs/public/demos/<topic>/` 独立 HTML + Markdown iframe，统一 `.demo-frame` 负责边框和站内布局；本次全景适合沿用这一模式。
- 文章必须在 Markdown 中重复承载关键结论，因为 iframe 不应成为核心知识的唯一载体。
- 新页面应放入“工业控制”导航，与柴发逻辑、FBD/SFC 和 IEC 61850 相邻；全景页作为这些专题的上位入口。
- 原版可视化由 Codex 内联片段渲染为自包含 HTML。渲染结果包含一层 `srcdoc` iframe，因此站点适配器需要递归同步主题、测量内层正文高度并把高度传回文章 iframe；适配器不改变图形节点、文字、筛选或交互逻辑。
- 文章采用“评估口径 → 原版全景 → 八个已了解模块 → 正在建立 → 需要补齐 → 五步路线”的结构，动画失效时仍保留全部主要结论。
- 实际浏览器测量表明自适应高度稳定：桌面全量视图约 1271 px，筛选“已了解”后缩至约 1062 px；375 px 视口下文章和内层全景均无横向溢出。
- 站点深浅主题能够递归同步到原版图的外层和 `srcdoc` 内层；模块点击会更新证据与下一步，状态筛选会同步隐藏非目标模块。
- PR #31 已通过 GitHub 构建门禁并合并；Pages 运行 `29990932666` 的 build 与 deploy 均成功。正式文章、原版全景和 sitemap 均返回 HTTP 200，sitemap 已包含新路由。
- Linear 状态同步仍受免费版 issue 上限阻止；这是项目管理工具限制，不影响版本化范围、测试证据和生产发布结果。

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
- 2026-07-16 从 2026-06-02 的本地历史会话中确认：用户曾为 `foxtiny.com` 创建最小权限的 DNS Edit API Token，并用它配置过 `mcp.foxtiny.com`。该 Token 仍有效，现已用于创建 DNS-only CNAME：`energybook.foxtiny.com` → `syrangg813s7vi-web.github.io`。
- GitHub Pages 在 DNS 生效后立即接受自定义域名并可启用强制 HTTPS。正式地址 `https://energybook.foxtiny.com/` 已通过直连 GitHub Pages 节点验证返回 HTTP 200；本机解析器短暂保留了此前的 NXDOMAIN 缓存，不影响公共 DNS。

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
- Cloudflare 普通域名控制台与 Zero Trust 控制台出现相同异常：`foxtiny.com` 页面报刷新错误，直接访问 DNS 记录路由只返回 `{}`；本机也没有可用的 DNS 写权限 CLI 会话。正式 CNAME 继续保留为待办，Pages 构建暂时使用 `/energy-handbook/` 基路径，使 GitHub Pages 备用地址能够加载完整客户端资源。
- 首次真实批阅任务 `task_e_6a579b97fe608324ae2e1d4d2024b3a0` 已到 READY，包含 2 个文件的有效差异，但 GitHub 没有新分支或 PR；这证明 Cloud Codex 的原生 GitHub 集成不会在当前环境中替执行器完成提交。
- 仓库已有 `.github/workflows/auto-review.yml`：收到 `codex/review-*` push 后会重复执行文件白名单、动画安全策略和 `npm run check`，随后创建 PR 并启用 squash 自动合并。缺口只在 READY diff → 分支 push。
- GitHub 仓库已开启 `allow_auto_merge` 和合并后删除分支。采用写 Deploy Key 可将 molt 的 GitHub 写权限严格限制在 `syrangg813s7vi-web/energy-handbook`，比复用个人 OAuth/PAT 权限更窄；PR 创建和合并继续由仓库内置 `GITHUB_TOKEN` 完成。
- 真实任务已完成闭环：READY diff 经发布器推送为 `codex/review-6a579b97fe60`，GitHub Action 通过策略、测试与构建后创建并合并 PR #3。修复同一 job 内 `--auto` 自等待后，烟雾测试 PR #5 在 21 秒内自动创建、squash 合并并删除临时分支。
- 发布器任务记录持久化在 `/var/lib/energy-review/jobs`，systemd 服务重启后会继续扫描；Cloud 失败和发布失败都有明确状态，发布最多自动尝试 3 次，避免无限失败循环。

## 2026-07-16：批阅批量提交

- 当前前端每次划线填写要求后立即 POST，因此每条批注都会产生独立 Cloud 任务、分支和 PR；用户要求改为先汇总、后一次提交。
- n8n 当前仅透传请求体并覆盖服务端验证的 `actorEmail`，无需修改节点或连接；批量能力可以在前端与隔离执行器的负载协议中完成，现有 n8n 错误输出和凭据保持不变。
- 批量清单以 `sessionStorage` 暂存，可跨站内页面保留但在浏览器会话结束后自然清除；上限 20 条，避免提示词和请求体无界增长。服务端继续接受旧单条格式，便于前后端滚动部署。
- 批量实现不改变认证与自动合并边界：一批请求只经过一次网关限流、一次 n8n 转发、一个 Cloud 任务、一个服务端派生分支和一个 PR；Cloud 提示会逐条列出目标文章、选区、上下文和修改要求，并要求合并冲突修改且不得遗漏。

## 2026-07-17：失效链接巡检

- 自定义域名 `energybook.foxtiny.com` 已生效，GitHub Pages 项目地址会 301 到该域名；生产构建使用根路径 `/` 是正确的。首次按跳转前 GitHub 地址解析资源得到的 404 属于爬虫假阳性。
- 从 sitemap 抓取的 9 个页面和 33 个站内页面/资源直接请求均为 200，但真实点击仍复现失败：VitePress 客户端会接管 Markdown 中指向 `public/demos/*.html` 或演示目录的站内链接，并按文档路由处理，最终显示 VitePress 404；原始静态 HTML 直接请求为 200。
- 已确认受影响模式至少包含：车桩协议 2 条“单独打开”、IEC 61850 2 条“单独打开”、FBD/SFC 的 PLC 执行演示入口。建设指南示例还指向实际不存在的 `/demos/plc/fbd-scan.html`（HTTP 404；仓库只有 `fbd-scan-excerpt.html`）。
- 浏览器运行时把同一车桩演示链接临时设为 `target="_blank" rel="noopener"` 后，点击成功打开原始 `.html`，页面标题为 `Vehicle Charger Protocol Animation`；这验证了可靠修复方案是让静态演示链接走浏览器原生新标签页，而不是 VitePress 客户端路由。
- 外部资料抽查大多返回 200；国家标准全文公开系统对自动巡检返回 403，更像反爬限制，不能据此判定用户浏览器中的链接失效。

## 2026-07-20：专注阅读模式

- VitePress 1.6.4 在桌面端通过 `.VPContent.has-sidebar` 的左内边距为章节导航留位，文章正文在 `.VPDoc.has-aside .content-container` 中限制为 688 px；只隐藏元素而不同时覆盖这两处布局约束，正文不会真正获得更多空间。
- 右侧本页目录从 1280 px 开始显示，左侧章节导航从 960 px 开始常驻。因此专注阅读以 960 px 为桌面断点，并同时隐藏两侧目录、清除正文左侧留位、把可读正文上限扩展为 960 px。
- 阅读偏好只需要一个浏览器本地布尔值。状态、按钮和布局 CSS 可以保持单向依赖，不需要接入批阅层或任何服务端状态。

## 2026-07-20：常见组态文章

- 四个教学动画的领域状态和视觉结构不同，但“当前步骤、自动播放、单步、复位、卸载时清理定时器”完全相同；将这部分提取为无领域知识的状态层，可以减少重复而不耦合具体组态。
- 并网点数据选择必须区分“同一物理并网点的主备测量选择”和“多个物理并网点的拓扑求和”，否则功能块名称容易造成错误理解。
- 光伏均衡中的“均衡”不是相同 MW，而是根据当前可发能力和调节裕度合理分担；单元限幅后必须计算剩余量并再次分配。
- 标幺值的固定额定基准适合主控制尺度，动态可发能力更适合作为均衡权重和限幅；二者都叫百分比，但不能混用。
- 过调检测需要同时考虑调节方向、死区、持续时间、指令变化闭锁和复归滞环；仅凭偏差变号不能确认有害过调。
- VitePress Vue 组件可以在 SSR 首屏输出完整初态，并在客户端激活交互；正文同时保存教学结论，使动画失效时文章仍可理解。

## 2026-07-21：运行模式与数据管理组态

- 离网控制与黑启动都可能由构网型电源建立 V/f，但起点不同：离网切换通常从带电母线开始，黑启动从全站无压开始，二者不能合并成同一状态机讲解。
- 并网控制的场站指标位于并网点；设备指令应按可发能力、SOC 和调节裕度分配，而不是要求所有设备使用相同 MW 或固定能力百分比。
- `gridswitch_ctrl` 需要把联锁、同期窗口、稳定确认、开关动作时间、辅助触点和保护跳闸优先级作为完整状态机，不能简化成合闸命令透传。
- `fault_record` 保存组态选定通道的触发前后高分辨率波形、数字状态与元数据，并不默认保存全场所有器件的全部电流电压。
- `sample_data_manager` 持续处理日常时间序列，负责点表、时间戳、质量、对齐、缓存、分层存储和查询；它与事件触发的故障录波在时间尺度与用途上互补。
- 桌面图形使用绝对定位时，文本换行会让实际卡片高度超过最小高度。遮挡验收必须读取渲染后的边界矩形，而不能只凭 CSS 的 `top` 与 `min-height` 推断。
- SVG 会按 `viewBox` 缩放，而固定像素的卡片位置不会随正文宽度同比缩放；即使某一个视口看似对齐，普通正文与专注阅读切换后仍会错位。图上节点应以百分比中心点定位，并让 SVG 使用与容器一致的非等比坐标映射；移动端切换到网格布局时必须显式清除位移变换。

## 2026-07-22：十一张常见组态动画统一

- 线上图与本地演示不一致的根因不是背景或暗色模式，而是站点使用了重新实现的 Vue 图形；节点结构、路径、步骤数据和时序都已偏离本地原版。
- 十一张本地 HTML 原样进入版本库，并通过同一个 iframe 适配层嵌入，能够以 Git 中的原版文件作为唯一权威来源，同时保留文章组件名称和 Markdown 引用不变。
- 适配层只负责站点边界能力：基路径、主题同步、沙箱和自适应高度；动画内部的按钮、脚本、路径与播放时序不再二次实现。
- iframe 自适应高度不能用随视口变化的 `documentElement.scrollHeight` 或 `body` 高度作为反馈输入，否则“iframe 变高 → 根/正文高度变高 → iframe 再变高”会形成循环。应测量 `body` 内实际可见子元素的最下边界，并补齐正文内边距；观察 `body` 仍可捕获内部重排。
- 十一份站点静态文件除统一增加字符集、viewport 和公共样式入口外，主体均与本地原版逐字节一致；公共视觉样式也复制为版本化资源，恢复不依赖开发机缓存。

## 2026-07-22：Codex 原版图形全局规则

- “常见组态”专题已经采用原版 HTML，但全局《内容与动画》仍建议按需求重新选择 Mermaid、Vue 或独立 HTML，无法约束其他文章保持 Codex 本地原版。
- 全局规则需要同时约束权威来源、允许的站点职责和禁止的二次重绘；仅写“使用 iframe”不能保证节点、路径、步骤与时序一致。
- 原版必须进入 Git 管理的素材目录。Codex 临时可视化目录适合生成和确认，但不能成为灾难恢复时的唯一副本。
