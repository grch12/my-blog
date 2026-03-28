import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import PostList from "./PostList.vue";
import TagList from "./TagList.vue";
import Layout from "./Layout.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("PostList", PostList);
    app.component("TagList", TagList);
  },
} satisfies Theme;
