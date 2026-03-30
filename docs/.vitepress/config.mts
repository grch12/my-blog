import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";

import fs from "fs";
import path, { basename, parse } from "path";
import { get } from "http";

const POSTS_DIR = path.resolve(__dirname, "../posts");

function getAllSubDirs(dir: string): string[] {
  const subDirs: string[] = [];

  if (!fs.existsSync(dir)) return subDirs;

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      subDirs.push(fullPath);
      subDirs.push(...getAllSubDirs(fullPath));
    }
  }

  return subDirs;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "grch12 的博客",
  description: "记录技术与思考",
  base: "/my-blog/",
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
      { text: "关于", link: "/about" },
    ],

    sidebar: generateSidebar([
      {
        documentRootPath: "./docs",
        scanStartPath: "posts",
        basePath: "/posts/",
        resolvePath: "/posts/",
        useTitleFromFrontmatter: true,
        manualSortFileNameByPriority: getAllSubDirs(POSTS_DIR)
          .map((dir) => basename(dir))
          .sort((a, b) => Number(b) - Number(a)), // sort by dir name, desc
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
