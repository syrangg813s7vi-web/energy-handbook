# V/F/P/Q 动画原版快照

原版提交：f11fccfd3d2a5c1ed639b1d56c34a8174cb71039。

app/、components/ 和 lib/ 保留该提交中参与动画的原始文件，未重绘或另写控制模型。此目录是本站所用版本的版本化源快照；更新时应引入一个明确的原版提交，并记录校验值，避免在消费端另行修改模型。

export.mjs 仅将 React 入口和原版样式打包为自包含 HTML，移除对 Sites 运行时和登录态的依赖。package.json 与锁文件保留原版依赖树；此导出不使用其中的 Sites 构建命令。

## 恢复及重新导出

使用 Node.js 22，在本目录执行：

```sh
npm ci
node export.mjs
```

然后在仓库根运行 npm run docs:build。生成文件为 docs/public/demos/vfpq/index.html，可通过离线浏览器直接运行；无业务数据库、运行时密钥或用户状态。依赖许可证随打包代码的法律注释保留。

回滚：通过正常 PR 回退本目录、动画 HTML、文章及导航的发布提交。本文的源码哈希记录在 SOURCE.sha256；运行 shasum -a 256 -c SOURCE.sha256 校验。
