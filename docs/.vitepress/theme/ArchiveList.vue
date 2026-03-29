<script setup lang="ts">
import { data as posts } from "../utils/posts.data";
import { Post } from "../../../defines";
import { withBase } from "vitepress";

let archives: {
  [key: string]: Post[];
} = {};

posts.forEach((post) => {
  const year = post.date.split("/")[0];
  if (!archives[year]) {
    archives[year] = [];
  }
  archives[year].push(post);
});
</script>

<template>
  <ul>
    <li v-for="year in Object.keys(archives)" :key="year">
      <h2>{{ year }} 年</h2>
      <ul>
        <li v-for="post in archives[year]" :key="post.url" :class="$style.post">
          <a :href="withBase(post.url)">{{ post.title }}</a>
          <span>{{ post.date }}</span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style module>
.post span {
  float: right;
}
</style>
