<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData, withBase } from "vitepress";
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

    <template #not-found>
      <div :class="$style.notFound">
        <h1>404</h1>
        <p>找不到页面</p>
        <a :href="withBase('/')">返回首页</a>
      </div>
    </template>
  </Layout>
</template>

<style module>
.notFound {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.notFound > h1 {
  font-size: 5em;
  font-weight: 500;
  margin-bottom: 2.5rem;
}

.notFound > p {
  font-size: 1.5em;
  margin-bottom: 2rem;
}

.notFound > a {
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  padding: 0.5em 1em;
  border-radius: 50em;
}
</style>
