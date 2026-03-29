<script setup lang="ts">
import { withBase } from "vitepress";
defineProps<{ tags: string[] | undefined }>();
</script>

<template>
  <span v-for="(tag, index) in tags" :key="tag" :class="$style.tagList">
    <a :href="withBase(`/tag/${tag}`)" :class="$style.tag">{{ tag }}</a>
    <span v-if="index !== (tags?.length || 0) - 1">，</span>
  </span>
</template>

<style module>
.tagList {
  line-height: 200%;
}
.tagList > .tag {
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  padding: 2px 6px;
  margin: 0 2px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.tagList > .tag:hover {
  color: var(--vp-c-brand-3);
  text-decoration: underline;
  transition: all 0.2s ease-in-out;
}
</style>
