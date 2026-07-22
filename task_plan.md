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

### 阶段 2.1：在线登录、批阅与自动改稿 `complete`

- [x] 确定公开阅读、登录后批阅的产品形态
- [x] 确定自托管 n8n → Codex Cloud → GitHub 的执行架构
- [x] 定义文章与动画代码的修改白名单
- [x] 在 VitePress 中加入登录状态、文字划选和批阅面板
- [x] 建立 GitHub OAuth 登录与短期会话交换
- [x] 实现短期会话网关、OAuth state/PKCE、GitHub 仓库写权限校验、CORS 和提交限流
- [x] 建立并发布 n8n 批阅接收、任务追踪和错误处理工作流
- [x] 在 `molt` 建立低权限 Codex Cloud 执行器
- [x] 加入文件范围、安全扫描和构建门禁代码
- [x] 接通临时分支、PR 与自动合并门禁
- [x] 为 READY 任务增加持久化发布器：应用 Cloud diff、策略复检、推送受限分支
- [x] 配置仅绑定 `energy-handbook` 的写入 Deploy Key，并完成真实任务端到端合并
- [x] 完成端到端验证并发布

### 阶段 2.2：批阅清单与批量提交 `complete`

- [x] 将单条批阅抽屉改为“加入清单”，支持查看、删除和跨页面暂存
- [x] 一次提交最多 20 条批注，只创建一个 Cloud Codex 任务和一个 PR
- [x] 服务端兼容旧单条负载，并对批量条数、单条长度和总请求大小执行校验
- [x] 更新测试、使用文档并完成浏览器与端到端部署验证

### 阶段 2.3：站内失效链接巡检 `in_progress`

- [x] 抓取线上页面的站内导航、正文链接、iframe 与静态资源地址
- [x] 区分 GitHub Pages 子路径错误、缺失文件和客户端路由错误
- [ ] 修复确认失效的链接并增加自动化链接门禁
- [ ] 完成线上点击回归与 Pages 部署验证

### 阶段 2.4：专注阅读模式 `complete`

- [x] 在 Linear TIN-341 记录范围、分层、验收标准、测试与回滚方式
- [x] 完成状态层、交互层和布局层的版本化设计
- [x] 实现桌面端左右目录隐藏、正文扩展与偏好记忆
- [x] 完成构建和桌面/移动端浏览器验收
- [x] 完成 PR 门禁、合并和 Pages 生产复验

### 阶段 2.5：常见组态文章与动画 `complete`

- [x] 在 Linear TIN-343 记录范围、分层、验收标准和回滚方式
- [x] 完成文章层、独立演示层和公共步骤状态层的版本化设计
- [x] 编写并网点数据选择、光伏均衡、标幺值和过调检测正文
- [x] 实现四个支持自动播放、单步和复位的 Vue 动画
- [x] 完成完整构建和桌面/移动端浏览器验收
- [x] 完成 PR 门禁、合并和 Pages 生产复验

### 阶段 2.6：常见组态动效对齐 `complete`

- [x] 在 Linear TIN-344 记录动效范围、分层、验收标准和回滚方式
- [x] 明确只对齐第一版本地演示的动态表现，不改变 EnergyBook 既有主题外观
- [x] 恢复曲线数据通路、连续流动粒子和活动路径反馈
- [x] 将功率条、标幺值和过调状态改为平滑插值
- [x] 完成完整构建和桌面/移动端浏览器验收

### 阶段 2.7：补充光伏储能变量分配 `complete`

- [x] 在 Linear TIN-345 记录教学范围、分层、验收标准和回滚方式
- [x] 扩展版本化设计，明确光伏与储能的功率关系、SOC 约束和策略边界
- [x] 新增第五个独立 Vue 动画并注册到主题
- [x] 补充文章正文、公式、输入输出、处理流程和与光伏均衡的层级区别
- [x] 完成完整构建和桌面/移动端浏览器验收

### 阶段 2.8：补充运行模式与数据管理组态 `complete`

- [x] 在 Linear TIN-347 记录六个新增组态的范围、验收标准与回滚方式
- [x] 扩展版本化设计，明确运行模式、开关控制、事件录波与连续采样的职责边界
- [x] 新增离网控制、并网控制、`gridswitch_ctrl`、黑启动、`fault_record` 和 `sample_data_manager` 六个独立 Vue 动画
- [x] 补充文章正文、输入输出、触发条件、运行顺序与工程边界
- [x] 完成完整构建和桌面/移动端浏览器验收
- [x] 完成 PR 门禁、合并和 Pages 生产复验

### 阶段 2.9：统一十一张常见组态原版动画 `in_progress`

- [x] 在 Linear TIN-348 记录范围、分层、验收标准和回滚方式
- [x] 更新版本化设计，明确本地原版 HTML 是动画结构、路径、步骤与时序的权威来源
- [x] 将十一张原版动画及公共视觉样式纳入站点静态资源
- [x] 用统一 iframe 适配层替换十一份二次重绘组件，并同步主题与内容高度
- [x] 完成单步、复位、自动播放、普通/专注阅读、移动端和主题浏览器验收
- [ ] 完成构建、PR 门禁、Pages 发布和生产复验

### 阶段 3：核心知识与数据可视化 `pending`

- [ ] 编写能源基础、电力系统、化石能源、可再生能源、储能等核心内容
- [ ] 建立可复用动画与图表组件库
- [ ] 为每个可视化提供数据来源和无 JS 降级内容

### 阶段 4：质量、发布与运营 `pending`

- [ ] 加入链接、Markdown、可访问性和构建检查
- [x] 完成 GitHub Pages 首次发布：<https://syrangg813s7vi-web.github.io/energy-handbook/>
- [x] 完成自定义域名 `energybook.foxtiny.com`（Cloudflare DNS、GitHub Pages 绑定与强制 HTTPS 均已完成）
- [ ] 建立版本、更新频率、数据时效性和反馈机制

## 当前关键决策

| 决策 | 状态 | 说明 |
|---|---|---|
| Markdown 作为主要内容源 | 已确定 | 易于维护、审核和迁移 |
| 动画实现 | 已更新 | 页内高交互组件使用 Vue + SVG/CSS；大型自包含演示使用 `public/demos/` HTML + iframe |
| 静态站点生成器 | 已确定 | VitePress 1.6.4 + Vue 3 + Vite 6.4.3 |
| 在线批阅身份 | 已更新 | 公开可读；GitHub OAuth 登录后才显示并允许批阅，仅授权本仓库具有 push/maintain/admin 权限的用户 |
| 自动改稿执行 | 已确定 | `n8n.foxtiny.com`（SSH `molt`）提交 `codex cloud` 任务，检查后自动 PR/合并 |
| READY 差异发布 | 已更新 | Cloud Codex 当前只产出 READY diff；molt 使用仓库专属 Deploy Key 推送 `codex/review-*`，GitHub Action 建 PR、复检并自动合并 |
| 默认修改边界 | 已确定 | Markdown、VitePress 动画组件及 `public/demos`；禁止工作流、依赖和站点配置 |
| 登录会话网关 | 已部署 | `n8n.foxtiny.com/energy-review`；OAuth state + PKCE；实时校验 `energy-handbook` 的 `permissions.push`；一次性码 2 分钟，批阅令牌 15 分钟 |
| 批阅提交粒度 | 已更新 | 每次划线先加入浏览器会话内的批阅清单；用户确认后整批生成一个 Cloud 任务、一个受限分支和一个 PR |

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
| 2026-07-15 | Cloudflare One 控制台进入 `/one/overview` 后持续停留在 Loading | 2 | 已刷新并改用可视化浏览器确认；账户仍显示 Zero Trust “Get started”，需要完成组织初始化后才能创建 Access 应用 |
| 2026-07-15 | Cloudflare Zero Trust 的 `/one/`、`/one/overview`、`/one/get-started` 均直接返回 JSON `{}` | 4 | 官方状态正常且新旧入口结果相同，判定为账户/新版控制台初始化故障；经用户同意改用无仓库 scope 的 GitHub OAuth 身份登录 |
| 2026-07-15 | 登录网关启用 `MemoryDenyWriteExecute` 后 Node.js V8 以 `TRAP` 退出 | 1 | 移除与 JIT 不兼容的单项限制，保留只读文件系统、无提权、能力清空等 systemd 隔离 |
| 2026-07-15 | `systemctl reload nginx` 因既有 PrivateTmp mount namespace 缺少 `/tmp` 而失败 | 1 | 配置已先通过 `nginx -t`；改由现有 master 进程执行 `nginx -s reload`，避免中断服务 |
| 2026-07-15 | n8n 重启后健康接口先于活动工作流注册完成，首次 Webhook 检查返回 404 | 1 | 等待启动日志确认工作流 Activated 后重试，错误链路返回预期 HTTP 400 |
| 2026-07-15 | 推送部署提交时远端 `main` 已新增能量管理文章提交，non-fast-forward 被拒绝 | 1 | 检查远端改动无重叠后 rebase 到 `origin/main`，重新运行完整测试与构建 |
| 2026-07-15 | Cloudflare 域名页报刷新错误，直接打开 `/dns/records` 仍只返回 `{}` | 3 | 当前无 DNS 写权限 CLI 会话；暂将 Pages 构建基路径设为 `/energy-handbook/`，保证备用地址功能完整，保留 CNAME 待控制台恢复 |
| 2026-07-16 | Wrangler OAuth 没有 DNS Write 权限 | 2 | 从 2026-06-02 本地历史会话恢复用户创建的、限定 `foxtiny.com` 的 DNS Edit Token，经验证仍有效，使用 Cloudflare API 创建 DNS-only CNAME |
| 2026-07-15 | Cloud Codex 任务完成后没有创建分支或 PR | 1 | 实测原生集成只保留 READY diff；改由低权限执行器应用 diff，并用单仓库 Deploy Key 推送受限分支 |
| 2026-07-15 | 发布器首次应用 READY diff 后误报没有修改 | 1 | `codex cloud apply` 默认将差异放入暂存区；文件检测改为 `git diff --name-only HEAD`，同时覆盖暂存与未暂存修改 |
| 2026-07-15 | PR #3 最后一步启用 auto-merge 返回 `Pull request is in unstable status` | 1 | 同一 push job 在结束前等待自身检查会形成循环；门禁均已在前序步骤通过，改为最后一步直接 squash merge |
| 2026-07-16 | Playwright `run-code` 用两个顶层语句注入本地测试会话时报语法错误 | 1 | 改为单个 async IIFE，保证 CLI 接收一个完整表达式 |
| 2026-07-16 | 重启批阅执行器后立即探测健康端口返回连接失败 | 1 | systemd 已 active 但 Node 尚在绑定端口；等待启动日志后重试，健康接口返回 200 |
| 2026-07-17 | 首次链接检索命令包含冲突的 shell 引号，zsh 报 `unmatched quote` | 1 | 将 Markdown 与 HTML 检索拆成两个简单 `rg` 命令后成功执行 |
| 2026-07-17 | Web open 对 GitHub Pages 与自定义域名返回 safe-open 内部错误 | 1 | 改用 curl 批量状态检查和 Playwright 真实点击验证，不重复相同调用 |
| 2026-07-17 | zsh 链接状态循环使用保留只读变量 `status` | 1 | 变量改名为 `http_code` 后成功取得演示文件状态 |
| 2026-07-20 | Playwright CLI 使用不存在的 `goto` 子命令 | 1 | 按技能命令表改用 `open <url>` 导航，后续快照与验收正常 |
| 2026-07-20 | 生产测量的 Playwright `run-code` 表达式多写一个右括号 | 1 | 去掉非必要字段并用单一合法表达式重试，成功取得布局与持久化结果 |
| 2026-07-22 | iframe 高度测量先后读取 `documentElement.scrollHeight`、`body` 高度；两者都会吸收 iframe 视口高度，形成持续增长 | 2 | 改为测量 `body` 中实际可见子元素的最下边界并补齐内边距，十一张图稳定在 408–602 px |
| 2026-07-22 | 自动播放验收准备点击“暂停”时，动画已自行播放至末步，旧状态定位器数量变为 0 | 1 | 重新读取当前 DOM，确认十一张均到达末步且按钮自动恢复“自动演示”，随后按新状态逐张复位 |
| 2026-07-22 | 桌面任务环境默认 `PATH` 不含 npm，首次完整检查的嵌套 `npm` 脚本找不到命令 | 1 | 将已安装的 Homebrew Node/npm 目录显式加入 `PATH` 后重新运行完整检查 |
| 2026-07-22 | 桌面任务环境默认 `PATH` 不含 GitHub CLI，首次创建 PR 命令找不到 `gh` | 1 | 定位已安装的 GitHub CLI 并使用绝对路径重试 |
