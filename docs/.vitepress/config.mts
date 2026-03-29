import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "grch12 的博客",
  description: "记录技术与思考",
  lang: "zh-CN",
  locales: {
    "/": {
      label: "简体中文",
      lang: "zh-CN",
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "全部标签", link: "/tag" },
      { text: "归档", link: "/archive" },
    ],

    sidebar: generateSidebar([
      {
        documentRootPath: "./docs",
        scanStartPath: "posts",
        basePath: "/posts/",
        resolvePath: "/posts/",
        useTitleFromFrontmatter: true,
      },
    ]),

    socialLinks: [{ icon: "github", link: "https://github.com/grch12" }],

    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    returnToTopLabel: "返回顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "切换夜间模式",
    outlineTitle: "本文内容",
  },
});
