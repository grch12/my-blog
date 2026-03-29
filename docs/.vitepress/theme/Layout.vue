<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import CommonFooter from "./CommonFooter.vue";
import Giscus from "./Giscus.vue";
import { computed } from "vue";

const { Layout } = DefaultTheme;
const { frontmatter, page } = useData();

const isPost = computed(() => page.value.filePath.startsWith("posts/"));

const hasCustomFooter = computed(() => !!frontmatter.value.customFooter);

const showCommonFooter = computed(() => isPost.value && !hasCustomFooter.value);
</script>

<template>
  <Layout>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>

    <template #doc-footer-before>
      <CommonFooter v-if="showCommonFooter" />
    </template>

    <template #doc-after>
      <Giscus v-if="isPost" />
    </template>
  </Layout>
</template>
