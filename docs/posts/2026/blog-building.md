---
title: 记搭建本博客的过程
date: 2026-03-28
description: 本文记录了搭建本博客的过程，以及如何解决过程中遇到的问题。如果你也有兴趣搭建自己的博客，不妨参考一下。
tags: [前端]
---

# 记搭建本博客的过程

最近一直在折腾 C++ 和汇编，好久没碰前端了。我在网络上搜索遇到的问题时，觉得很少有文章能把我遇到的问题讲清楚。在这段时间，我也写了一些 Markdown 记录自己的心得。我便想，为什么不搭建一个博客，既作为自己的在线知识库，也方便其他人呢？于是便有了本站。

## 安装 VitePress

在 GPT 的推荐下，我选择了 VitePress。不得不说，这个推荐甚合我意。Vue 是我学的第一个前端框架。大概是由于所谓的“初恋情结”吧，我对其他框架大都比较排斥。

安装 VitePress：

```bash
mkdir my-blog
cd my-blog
npm init -y
npm install -D vitepress
npx vitepress init
```

安装好后目录结构大概是这样的：

```
my-blog
├─ docs
│  ├─ .vitepress
│  │  └─ config.mts
│  ├─ index.md
│  └─ posts/
├─ package.json
```

运行 `npm run docs:dev`，在浏览器访问 `http://localhost:5173`，就可以看到 VitePress 的默认落地页了。

到了这一步，就可以直接在 `posts/` 里面写 Markdown 了。在浏览器中访问对应的地址即可看到它们转成 HTML 的样子。

## 主页自动展示文章列表

VitePress 默认的落地页实在不像个博客的样子。作为一个博客，起码要在主页展示文章列表吧？那么我们该如何实现呢？

VitePress 提供了 `createContentLoader` API，可以在构建时自动扫描所有 Markdown 文件，从而自动生成文章列表，无需手动维护。

要利用 `createContentLoader`，需要为每篇文章写好 frontmatter。例如下面是本文的 frontmatter：

```yaml
---
title: 记搭建本博客的过程
date: 2026-03-28
description: 本文记录了搭建本博客的过程，以及如何解决过程中遇到的问题。如果你也有兴趣搭建自己的博客，不妨参考一下。
tags: [前端]
---
```

### 创建数据加载器

::: code-group

```ts [defines.ts]
export interface Post {
  title: string;
  url: string;
  date: string;
  description?: string;
  tags?: string[];
}

export function createPost(
  url: string,
  frontmatter: Record<string, any>,
): Post {
  return {
    title: frontmatter.title,
    url,
    date: (frontmatter.date as Date).toLocaleString("zh-CN", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }),
    description: frontmatter.description,
    tags: frontmatter.tags,
  };
}
```

```ts [docs/.vitepress/utils/posts.data.ts]
import { createContentLoader } from "vitepress";
import { createPost, Post } from "../../../defines";

// 我们将文章按年份放在 posts/ 的不同子目录中
export default createContentLoader("./posts/**/*.md", {
  // 是否解析“摘录”？（否）
  // 参见 https://github.com/jonschlinkert/gray-matter#optionsexcerpt
  excerpt: false,

  // 将加载的数据进行转换，生成文章列表
  transform(raw): Post[] {
    // raw 是一个类型为 ContentData[] 的数组
    // ContentData 包含两个重要的属性：url 和 frontmatter
    return raw
      .map(({ url, frontmatter }): Post => createPost(url, frontmatter))
      .filter((p) => p.title && p.date)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date)); // 按日期排序
  },
});
```

:::

需要注意，用于数据加载的文件必须以 `.data.js` 或 `.data.ts` 结尾。

### 创建文章列表

在 `docs/.vitepress/theme/` 创建一个 `PostList` 组件（为方便观察核心逻辑，类名和样式等已略去）：

```vue
<script setup lang="ts">
import { Post } from "../../../defines";
defineProps<{ posts: Post[] }>();
</script>

<template>
  <div>
    <article v-for="post in posts" :key="post.url">
      <h2>
        <a :href="post.url"> {{ post.title }}</a>
      </h2>
      <p v-if="post.description">{{ post.description }}</p>
      <div>
        <span>{{ post.date }}</span>
        <div class="meta">
          <span>{{ post.date }}</span>
          <span v-if="post.tags?.length"> · {{ post.tags.join(', ') }}</span>
        </div>
      </div>
    </article>
  </div>
</template>
```

创建 `docs/.vitepress/theme/index.ts`，在其中注册全局组件：

```ts
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import PostList from "./PostList.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("PostList", PostList);
  },
} satisfies Theme;
```

将组件添加到 `docs/index.md` 中：

```md
<script setup>
// 数据加载器本身并没有导出 data。这是因为 VitePress 在后台调用了 load() 方法
// 并通过名为 data 的具名导出隐式地暴露了结果。
import { data as posts } from "./.vitepress/utils/posts.data";
</script>

# 最新文章

<PostList :posts="posts" />
```

然后，我们在 `post/2026/` 中新建 Markdown 文件，它就会自动显示在主页上了

## 实现标签功能

我们刚刚在 frontmatter 中为文章添加了标签。假如能借助标签对文章进行整理，就更好了。例如这样：

```
/tag          标签总览
/tag/<标签名> 有此标签的所有文章
```

### 标签总览

标签总览实现起来较为简单。同样地，我们需要创建一个数据加载器：

:::code-group

```ts [defines.ts]
export interface Tag {
  name: string;
  count: number;
}
```

```ts [docs/.vitepress/utils/alltags.data.ts]
import { createContentLoader } from "vitepress";

export default createContentLoader("./posts/**/*.md", {
  excerpt: false,
  // 返回 Tag[]
  transform(raw) {
    // tags: 键值对
    // 键为标签名，值为带此标签的文章数量
    let tags: { [key: string]: number } = {};

    // 统计每个标签的文章数量
    raw.forEach(({ frontmatter }) => {
      frontmatter.tags.forEach((tag: string) => {
        if (!tags[tag]) {
          tags[tag] = 1;
        } else {
          tags[tag]++;
        }
      });
    });

    // 将键值对转为 Tag[]
    return Object.entries(tags)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count); // 按文章数量排序
  },
});
```

:::

新建 `docs/tag/index.md`，在其中导入 `alltags.data`：

```md
<script setup lang="ts">
import { data as allTags } from "../utils/alltags.data";
</script>

<pre>{{ allTags }}</pre>
```

便可看到类似下面的内容：

```json
[
  {
    "name": "前端",
    "count": 1
  }
]
```

之后再写一个组件显示它即可。

### 标签页面

VitePress 提供了动态路由功能，可以使用单个 Markdown 文件作为“模板”生成许多页面。这对于实现各个标签页面来说无疑是再合适不过了。然而有一个问题：VitePress 是一个静态站点生成器，动态路由也需要知道所有可能的页面路径。

具体来讲，我们需要创建两个文件：`docs/tag/[tag].md` 作为模板，`docs/tag/[tag].paths.ts` 作为路径加载器，其中应当列举所有可能的路径，例如这样：

```ts
export default {
  paths() {
    return [
      { params: { tag: "前端" }},
      { params: { tag: "后端" }},
      // 更多标签……
    ]
  }
}
```

然而，这样手动枚举无疑是非常低效的，并且极易出差错。有没有办法能自动化呢？

你也许会想到再创建一个数据加载器。想法不错，可问题在于，动态路由在 VitePress 中处理得非常早，`paths()` 执行时，`createContentLoader` 还不可用。解决方案是在 `paths()` 中直接解析 Markdown 文件。`docs/tag/[tag].paths.ts` 的内容如下：

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.resolve(__dirname, "../posts");

function getAllTags(): string[] {
  const tagSet = new Set<string>();

  // 递归读取所有 Markdown 文件
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const { data: frontmatter } = matter(content);
        const tags: string[] = frontmatter.tags ?? [];
        tags.forEach((tag) => tagSet.add(tag));
      }
    }
  }

  scanDir(POSTS_DIR);
  return [...tagSet];
}

export default {
  paths() {
    const tags = getAllTags();
    return tags.map((tag) => ({
      params: { tag },
    }));
  },
};
```

而在各个标签页面内部，就可以照常使用数据加载器了。

之后文章中有新标签，它们对应的页面会自动被创建，无需手动维护任何列表。

> [!TIP]
> 新标签在服务器重启后才会被创建

本博客的完整源码可以在[这个仓库](//github.com/grch12/my-blog)中找到。
