import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "grch12 的博客",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: generateSidebar([{
      documentRootPath: "./docs",
      scanStartPath: "posts",
      basePath: "/posts/",
      resolvePath: "/posts/"
    }]),

    socialLinks: [{ icon: "github", link: "https://github.com/grch12" }],
  },
});
