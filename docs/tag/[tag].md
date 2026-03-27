---
title: 标签
---

<script setup>
import { useData } from "vitepress";
import { data as tagMap } from "../.vitepress/utils/tagmap.data";

const { params } = useData();
const currentTag = params.value.tag;
const posts = tagMap[currentTag];
</script>

# 标签：{{ currentTag }}

共 {{ posts.length }} 篇文章

<ul>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
  </li>
</ul>
