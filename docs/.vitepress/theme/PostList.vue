<script setup lang="ts">
import { Post } from "../../../defines";
defineProps<{ posts: Post[] }>();
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
        <span v-if="post.tags?.length"> · </span>
        <TagList :tags="post.tags" />
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
  margin-top: 4rem;
}

.postItem > h2 {
  padding-top: var(--articles-gap);
  margin-top: 0;
}

.postItem > h2 > a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.postItem > p {
  margin-bottom: 16px;
  margin-left: 0.5em;
}

.meta {
  color: var(--vp-c-text-2);
}
</style>
