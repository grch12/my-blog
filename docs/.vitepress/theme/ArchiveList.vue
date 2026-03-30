<script setup lang="ts">
import { data as posts } from "../utils/posts.data";
import { Post } from "../../../defines";
import { withBase } from "vitepress";

let archives: {
  year: string;
  posts: Post[];
}[] = [];

// Loop through all posts and group them by year
posts.forEach((post) => {
  // Extract the year from the post date
  const year = post.date.split("/")[0];

  // Check if the year already exists in the archives
  const existingYear = archives.filter((a) => a.year === year);

  // If the year does not exist, create a new entry with the post
  if (existingYear.length === 0) {
    archives.push({
      year,
      posts: [post],
    });
  } else {
    // If the year already exists, add the post to the existing year
    existingYear[0].posts.push(post);
  }
});

archives.sort((a, b) => {
  return Number(b.year) - Number(a.year);
});
</script>

<template>
  <ul>
    <li v-for="annual in archives" :key="annual.year">
      <h2>{{ annual.year }} 年</h2>
      <ul>
        <li v-for="post in annual.posts" :key="post.url" :class="$style.post">
          <a :href="withBase(post.url)">{{ post.title }}</a>
          <span>{{ post.date }}</span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style module>
.post {
  display: flex;
  justify-content: space-between;
}
</style>
