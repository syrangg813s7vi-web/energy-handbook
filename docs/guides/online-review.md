# 在线批阅与自动改稿

能源知识库采用“公开阅读、登录批阅”的方式。任何人都可以阅读文章、搜索知识点和运行交互动画；只有授权维护者登录后，页面才会显示划线批阅入口。

## 使用流程

1. 点击导航中的“登录批阅”，完成 GitHub 身份验证。
2. 在文章正文中划选需要修改的文字。
3. 填写修改要求并提交。
4. n8n 将页面、选区、上下文和要求整理为云端 Codex 任务。
5. Cloud Codex 修改 Markdown 或动画代码、运行构建，并通过原生 GitHub 集成提交 `codex/review-*` 分支和 PR。
6. 仓库 Action 自动检查文件范围、安全规则和 VitePress 构建。
7. 检查全部通过后自动合并 PR，GitHub Pages 随后发布新版。

## 登录与会话

登录由 GitHub OAuth 负责，不在知识库中维护密码。网关使用 `state` 和 PKCE 保护登录回调，只读取 GitHub 公开身份，并按不可变数字用户 ID 判断批阅权限；随后返回只能使用一次、两分钟过期的授权码，网站用它换取 15 分钟批阅令牌。OAuth 临时令牌、ChatGPT Token 和服务密钥不会发送给浏览器或 n8n，也不会写入磁盘。

未登录或令牌过期时，批阅接口返回 `401`，页面保持只读。网关只接受正式知识库来源，并限制每位维护者的提交频率；n8n Webhook 只接受网关持有的独立凭据，隔离执行器再执行仓库边界和内容策略验证。

## 自动修改范围

默认允许：

- `docs/**/*.md`
- `docs/.vitepress/theme/components/**/*.vue`
- `docs/.vitepress/theme/components/**/*.ts`
- `docs/.vitepress/theme/components/**/*.css`
- `docs/public/demos/**/*.{html,js,css,svg,json,csv}`

默认拒绝 `.github/`、依赖文件、VitePress 全局配置、服务器文件、符号链接、子模块和其他仓库。动画代码不得加入外部脚本、动态代码执行、凭据读取或未经批准的网络请求。

## 自动合并门禁

`molt` 不下载或应用代码差异，也不持有 GitHub 写入凭据；它只提交和查询 Cloud Codex 任务。Cloud Codex 使用绑定到本仓库的原生 GitHub 集成提交 `codex/review-*` 临时分支和 PR；仓库内的 GitHub Action 再执行自动合并，并依次检查：

1. 选中的原文仍能在目标文章中唯一定位。
2. 修改文件全部位于白名单内。
3. 动画代码通过静态安全检查。
4. `npm run check` 成功。
5. PR 的必需检查全部通过。

任何一步失败都会停止合并并保留任务记录，便于维护者检查和重试。
