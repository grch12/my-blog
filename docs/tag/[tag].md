---
title: 标签
---

<script setup>
import { useData } from "vitepress";
import { data as tagMap } from "../.vitepress/utils/tagmap.data";
import PostList from "../.vitepress/theme/PostList.vue";

const { params } = useData();
const currentTag = params.value.tag;
const posts = tagMap[currentTag];
</script>

# 标签：{{ currentTag }}

共 {{ posts.length }} 篇文章

<PostList :posts="posts" />
