<script setup lang="ts">
import { useData } from "vitepress";
const { frontmatter } = useData();
</script>

<template>
  <footer :class="$style.footer">
    <p>
      创作于
      {{
        new Date(frontmatter.date).toLocaleString("zh-CN", {
          timeZone: "UTC",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
      }}
    </p>
    <p>
      标签：
      <TagList :tags="frontmatter.tags" />
    </p>
    <p>
      本站文章若无特殊说明，均按照
      <a href="//creativecommons.org/licenses/by-nc/4.0/deed.zh-hans" :class="$style.license">
        Creative Commons 署名-非商业性使用 4.0 协议国际版</a
      >
      发布，转载请注明出处。
    </p>
  </footer>
</template>

<style module>
.footer {
  padding: 0.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  color: var(--vp-c-text-2);
  margin-bottom: 4rem;
}

.footer > p {
  margin: 16px 0;
}

.footer > p:first-child {
  margin-top: 0;
}

.footer > p:last-child {
  margin-bottom: 0;
}

.footer a {
  padding: 0 !important;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

a.license {
  text-decoration: underline;
}
</style>
