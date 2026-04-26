<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();

/**
 * Injects Giscus script into the page.
 *
 * This function will create a <script> tag with the Giscus client
 * script and append it to the container with the id "giscus-container".
 * The script attributes are set to the values required by Giscus.
 * If the container does not exist, the function will return immediately.
 *
 */
function injectGiscus() {
  const container = document.getElementById("giscus-container");
  if (!container) return;

  container.innerHTML = "";

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

  document.getElementById("giscus-container")?.appendChild(script);
}

/**
 * Updates the Giscus iframe with the current route path.
 *
 * If the Giscus iframe does not exist, injects the Giscus script into the page.
 *
 * Posts a message to the Giscus iframe with the current route path set as the term.
 * The message is posted to the "https://giscus.app" origin.
 */
function updateGiscus() {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame",
  );

  if (iframe) {
    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            term: route.path.match(/\/?(my-blog\/.*)\.(md|html)/)?.[1],
          },
        },
      },
      "https://giscus.app",
    );
  } else {
    injectGiscus();
  }
}

onMounted(() => {
  injectGiscus();
});

watch(() => route.path, updateGiscus);
</script>

<template>
  <div id="giscus-container" style="margin-top: 48px"></div>
</template>
