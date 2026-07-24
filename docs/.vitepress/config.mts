import { defineConfig } from "vitepress";

const base = process.env.BASE_PATH ?? "/";
const siteUrl = "https://energybook.foxtiny.com";

export default defineConfig({
  lang: "zh-CN",
  title: "能源知识库",
  description: "用可追溯的文本和可交互的视觉演示，解释能源如何生产、转换、储存与使用。",
  base,
  sitemap: {
    hostname: siteUrl,
  },
  transformHead({ pageData }) {
    const canonicalPath = pageData.relativePath
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, "");

    return [["link", { rel: "canonical", href: `${siteUrl}/${canonicalPath}` }]];
  },
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#0f8a83" }],
    ["link", { rel: "icon", type: "image/svg+xml", href: `${base}logo.svg` }],
  ],
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },
  themeConfig: {
    logo: {
      light: "/logo.svg",
      dark: "/logo.svg",
      alt: "能源知识库",
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "行业洞察",
        items: [
          { text: "欧洲能源产业2026—2030", link: "/insights/europe-energy-outlook-2026-2030" },
          { text: "欧洲储能与微网机会", link: "/insights/europe-storage-microgrid-opportunities" },
        ],
      },
      { text: "能源基础", link: "/knowledge/energy-basics" },
      { text: "能量管理", link: "/knowledge/energy-management" },
      { text: "车桩协议", link: "/knowledge/ev-charging-protocols" },
      { text: "IEC 104", link: "/knowledge/iec104-design-intent" },
      { text: "建设指南", link: "/guides/content-and-animation" },
      { text: "在线批阅", link: "/guides/online-review" },
    ],
    sidebar: [
      {
        text: "行业洞察",
        items: [
          { text: "欧洲能源产业2026—2030", link: "/insights/europe-energy-outlook-2026-2030" },
          { text: "欧洲储能与微网机会", link: "/insights/europe-storage-microgrid-opportunities" },
        ],
      },
      {
        text: "能源基础",
        items: [
          { text: "能量、功率与效率", link: "/knowledge/energy-basics" },
          { text: "能量管理是在做什么", link: "/knowledge/energy-management" },
          { text: "车桩协议：从第一性原理出发", link: "/knowledge/ev-charging-protocols" },
        ],
      },
      {
        text: "工业控制",
        items: [
          { text: "能源控制器知识全景", link: "/knowledge/energy-controller-panorama" },
          { text: "常见组态", link: "/knowledge/common-configurations" },
          { text: "柴发的逻辑组态", link: "/knowledge/diesel-generator-logic-configuration" },
          { text: "FBD与SFC", link: "/knowledge/fbd-sfc" },
          { text: "IEC 104设计初衷", link: "/knowledge/iec104-design-intent" },
          { text: "IEC 61850设备接入", link: "/knowledge/iec61850-device-integration" },
        ],
      },
      {
        text: "建设指南",
        items: [
          { text: "内容与动画", link: "/guides/content-and-animation" },
          { text: "动画驱动写作案例", link: "/guides/animation-led-writing-case" },
          { text: "在线批阅", link: "/guides/online-review" },
          { text: "灾难恢复", link: "/guides/disaster-recovery" },
          { text: "路线图", link: "/roadmap" },
        ],
      },
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索",
            buttonAriaLabel: "搜索",
          },
          modal: {
            noResultsText: "无相关结果",
            resetButtonTitle: "清除查询",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换至浅色主题",
    darkModeSwitchTitle: "切换至深色主题",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "回到顶部",
    langMenuLabel: "切换语言",
    skipToContentLabel: "跳转到正文",
    footer: {
      message: "内容与代码许可证待项目确认",
      copyright: "Copyright © 2026 能源知识库贡献者",
    },
  },
});
