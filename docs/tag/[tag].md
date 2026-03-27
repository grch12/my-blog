---
title: 标签
---

<script setup>
import { useData } from "vitepress"
import { data as allTags } from "../.vitepress/utils/alltags.data"

const { params } = useData();
const currentTag = params.value.tag;
const posts = allTags.find()
</script>

# 标签：{{ currentTag }}

共 {{ posts.length }} 篇文章

<ul>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
  </li>
</ul>
