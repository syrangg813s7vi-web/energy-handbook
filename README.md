# 能源知识库

一个以 Markdown 为内容源、支持 Vue 组件和独立 HTML 动画的中文能源知识库。站点由 VitePress 构建，并通过 GitHub Actions 发布到 GitHub Pages。

正式站点：<https://energybook.foxtiny.com/>

## 本地预览

需要 Node.js 18 或更高版本，建议使用 Node.js 22 LTS：

```bash
npm ci
npm run docs:dev
```

浏览器打开命令行显示的本地地址。

## 生产构建

```bash
npm run docs:build
npm run docs:preview
```

静态文件输出到 `docs/.vitepress/dist/`。

## 内容和动画

- Markdown 文章位于 `docs/`。
- VitePress 配置位于 `docs/.vitepress/config.mts`。
- 页内交互组件位于 `docs/.vitepress/theme/components/`，通过 Vue + TypeScript 实现。
- 强隔离的自包含 HTML 动画位于 `docs/public/demos/`，通过 iframe 嵌入 Markdown。
- 动画选型和验收规范见站内《内容与动画》。

## GitHub Pages

1. 在 GitHub 创建仓库并推送 `main` 分支。
2. 在 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。
3. 站点使用自定义域名 `energybook.foxtiny.com`，因此生产基路为 `/`。
4. `BASE_PATH` 仅用于本地或临时预览时覆盖基路。

项目级计划见 `task_plan.md`，技术判断见 `findings.md`，进度记录见 `progress.md`。
