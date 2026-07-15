---
layout: home

hero:
  name: 能源知识库
  text: 把能源系统讲清楚
  tagline: 用可追溯的文本和可交互的视觉演示，理解能源如何生产、转换、储存与使用。
  actions:
    - theme: brand
      text: 开始阅读
      link: /knowledge/energy-basics
    - theme: alt
      text: 建设路线
      link: /roadmap

features:
  - title: 建立共同语言
    details: 从能量、功率、效率和容量开始，分清容易混淆的概念与单位。
    link: /knowledge/energy-basics
    linkText: 阅读能源基础
  - title: 看见系统运行
    details: 用动画和可调参数演示发电、输配、储能和用能过程。
    link: /guides/content-and-animation
    linkText: 了解动画架构
  - title: 追溯每个结论
    details: 为数据和关键结论记录发布机构、时间、口径、原始链接和访问日期。
    link: /roadmap
    linkText: 查看建设计划
---

## 一个最小可交互示例

下面的能量流不是录屏，而是由 Markdown 直接引用的可复用 Vue 组件。调整输入和系统效率，观察有效输出与其他形式的输出如何变化。

<EnergyFlowDemo :input-watts="1000" :efficiency="82" />

::: info 演示边界
这个组件用于解释“输入 × 效率 = 有效输出”，不是光伏系统设计工具。实际发电量还受辐照度、温度、遮挡、逆变器特性和时间尺度等因素影响。
:::

## 建设中

当前已有 VitePress 底座、本地搜索、GitHub Pages 发布流程和两类动画扩展点：页内 Vue 组件与 iframe 独立 HTML 演示。下一步是确定主要读者与首批主题。
