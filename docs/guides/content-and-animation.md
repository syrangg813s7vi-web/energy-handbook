---
title: 内容与动画
description: 在 Markdown 中编写可维护、可访问的交互演示。
---

# 内容与动画

知识库使用两类动画架构：需要与文章紧密联动的组件使用 Vue；自包含、体积较大或需要样式隔离的演示使用独立 HTML + iframe。

## 页内 Vue 组件

组件在 `docs/.vitepress/theme/components/` 中集中维护并全局注册。Markdown 作者只需传入参数：

```md
<EnergyFlowDemo :input-watts="1000" :efficiency="82" />
```

<EnergyFlowDemo :input-watts="1000" :efficiency="82" />

适合：参数调节、数据图表、与页面主题或文章状态联动的小型演示。

## 独立 HTML 动画

将自包含 HTML 放在 `docs/public/demos/<topic>/`，在 Markdown 中直接嵌入：

```html
<iframe
  src="/demos/plc/fbd-scan.html"
  width="100%"
  height="360"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  title="FBD完整网络扫描演示"
  class="demo-frame"
></iframe>
```

适合：FBD/SFC 扫描演示、完整工艺模拟、独立教学工具和需要强 CSS/JavaScript 隔离的页面。

## 选型参考

| 需求 | 建议形式 |
|---|---|
| 流程、关系、系统边界 | Mermaid 或静态 SVG |
| 数据随时间或参数变化 | Vue 图表组件，数据单独存为 CSV/JSON |
| 和文章深度联动的概念演示 | Vue + TypeScript + SVG/CSS |
| 大型自包含模拟 | `public/demos/` 独立 HTML + iframe |
| 纯装饰效果 | 通常不做，避免分散阅读注意力 |

## 组件验收清单

- 有清晰的学习目标和模型边界。
- 关键状态不只依赖颜色表达。
- 所有控件可用键盘操作，输出变化可被辅助技术读取。
- 遵守用户的 `prefers-reduced-motion` 设置。
- 首屏有 SSR 输出，JavaScript 不可用时仍有基本信息。
- 核心结论同时写入 Markdown 正文；只有确实需要独立入口时才另给链接。
- 数据型演示标注来源、口径、日期和许可条款。
- 移动端不溢出，深色/浅色主题均可读。

## 不建议的做法

- 在每篇 Markdown 中复制大段 `<script>` 和 `<style>`。
- 用无文本替代的视频、Canvas 或 iframe 传达核心知识。
- 把未标注来源的外部数据直接固化在 JavaScript 中。
- 为了“更炫”而加入与学习目标无关的持续动画。

## 写作案例

怎样以动画为主线组织整篇文章，参见[动画驱动型技术文章写作案例](./animation-led-writing-case.md)。案例总结“先看全貌、再逐层拆解、最后形成完整认识”的通用行文方法。
