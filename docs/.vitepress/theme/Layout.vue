<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import CommonFooter from "./CommonFooter.vue";
import { computed } from "vue";

const { Layout } = DefaultTheme;
const { frontmatter, page } = useData();

const isPost = computed(() => page.value.filePath.startsWith("posts/"));
</script>

<template>
  <Layout>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>

    <template #doc-footer-before>
      <CommonFooter v-if="isPost" />
    </template>
  </Layout>
</template>
