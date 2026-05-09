<script setup lang="ts">
import { withBase } from "vitepress";
import { data as allTags } from "../utils/alltags.data";
</script>

<template>
  <div :class="$style.container">
    <a
      v-for="tag in allTags"
      :href="withBase(`/tag/${tag.name}`)"
      :class="$style.tag"
    >
      <span :class="$style.name">{{ tag.name }}</span>
      <span :class="$style.count">{{ tag.count }}</span>
    </a>
  </div>
</template>

<style module>
.container {
  margin-top: 3rem;
}

.tag {
  display: inline-block;
  height: calc(1.5em + 8px);
  background-color: var(--vp-c-bg-soft);
  border-radius: 50em;
  padding: 4px 10px;
  padding-right: 4px;
  margin: 4px 2px;
  text-decoration: none !important;
}

.tag > .count {
  display: inline-block;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-gray-2);
  margin-left: 0.5em;
  opacity: 0.8;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50em;
  text-align: center;
}

.tag:hover > .name {
  text-decoration: underline;
}
</style>
