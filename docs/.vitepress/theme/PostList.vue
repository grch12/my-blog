<script setup lang="ts">
import { data as posts } from "../utils/posts.data";
import { withBase } from "vitepress";
</script>

<template>
  <div :class="$style.postList">
    <article v-for="post in posts" :key="post.url" :class="$style.postItem">
      <h2>
        <a :href="post.url"> {{ post.title }}</a>
      </h2>
      <p v-if="post.description">{{ post.description }}</p>
      <div :class="$style.meta">
        <span>{{ post.date }}</span>
        <span v-if="post.tags.length"> · </span>
        <span v-for="tag in post.tags" :key="tag" :class="$style.tag">
          <a :href="withBase(`/tag/${tag}`)">{{ tag }}</a>
        </span>
      </div>
    </article>
  </div>
</template>

<style module>
:root {
  --articles-gap: 3rem;
}

.postList {
  display: flex;
  flex-direction: column;
  gap: var(--articles-gap);
}

.postItem > h2 {
  padding-top: var(--articles-gap);
  margin-top: 0;
}

.postItem > h2 > a {
  color: var(--vp-c-text-1);
  text-decoration: none ;
}

.postItem > p {
  margin-bottom: 16px;
  margin-left: 0.5em;
}

.meta {
  color: var(--vp-c-text-2);
}

.tag {
  background-color: var(--vp-c-gray-3);
  border-radius: 4px;
  padding: 2px 6px;
  margin: 0 4px;
}

.tag > a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.tag > a:hover {
  color: var(--vp-c-brand);
  text-decoration: underline;
}

.tag:hover {
  background-color: var(--vp-c-gray-2);
  transition: all 0.2s ease-in-out;
}
</style>