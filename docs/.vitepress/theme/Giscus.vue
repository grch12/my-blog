<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", "grch12/my-blog");
  script.setAttribute("data-repo-id", "R_kgDORzHd5A");
  script.setAttribute("data-category", "General");
  script.setAttribute("data-category-id", "DIC_kwDORzHd5M4C5iQE");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  document.getElementById("giscus")?.appendChild(script);
});
</script>

<template>
  <div id="giscus" style="margin-top: 48px"></div>
</template>
