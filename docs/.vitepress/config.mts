import { defineConfig } from "vitepress";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isUserOrOrganizationPage = repository === `${owner}.github.io`;
const base = process.env.BASE_PATH
  ?? (repository && !isUserOrOrganizationPage ? `/${repository}/` : "/");

export default defineConfig({
  lang: "zh-CN",
  title: "能源知识库",
  description: "用可追溯的文本和可交互的视觉演示，解释能源如何生产、转换、储存与使用。",
  base,
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
      { text: "能源基础", link: "/knowledge/energy-basics" },
      { text: "建设指南", link: "/guides/content-and-animation" },
    ],
    sidebar: [
      {
        text: "能源基础",
        items: [
          { text: "能量、功率与效率", link: "/knowledge/energy-basics" },
        ],
      },
      {
        text: "建设指南",
        items: [
          { text: "内容与动画", link: "/guides/content-and-animation" },
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
