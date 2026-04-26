---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: 主页

hero:
  name: "grch12 的博客"
  text: "记录技术与思考"
  tagline: 既供自己整理知识，也方便他人
  actions:
    - theme: brand
      text: 最新文章
      link: /index\#最新文章
    - theme: alt
      text: 归档
      link: /archive

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<script setup>
import { data as posts } from "./.vitepress/utils/posts.data";
</script>

# 最新文章

<PostList :posts="posts" />
