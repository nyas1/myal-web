<script setup lang="ts">
import { useData, inBrowser } from 'vitepress'
import { computed, provide, watchEffect, onMounted } from 'vue'
import { useNav } from 'vitepress/dist/client/theme-default/composables/nav'
import VPNavBar from 'vitepress/dist/client/theme-default/components/VPNavBar.vue'
import VPNavScreen from 'vitepress/dist/client/theme-default/components/VPNavScreen.vue'

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { frontmatter } = useData()

const hasNavbar = computed(() => frontmatter.value.navbar !== false)

provide('close-screen', closeScreen)

watchEffect(() => {
  if (inBrowser) {
    document.documentElement.classList.toggle('hide-nav', !hasNavbar.value)
  }
})

/** Mobile <960px: top bar stays visible on all pages (no scroll-away). */
onMounted(() => {
  if (!inBrowser) return
  document.documentElement.classList.add('vp-nav-shown-mobile')
})
</script>

<template>
  <div v-if="hasNavbar" class="vp-nav-spacer"></div>

  <header v-if="hasNavbar" class="VPNav">
    <VPNavBar :is-screen-open="isScreenOpen" @toggle-screen="toggleScreen">
      <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
      <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
      <template #nav-bar-content-before><slot name="nav-bar-content-before" /></template>
      <template #nav-bar-content-after><slot name="nav-bar-content-after" /></template>
    </VPNavBar>

    <VPNavScreen :open="isScreenOpen">
      <template #nav-screen-content-before><slot name="nav-screen-content-before" /></template>
      <template #nav-screen-content-after><slot name="nav-screen-content-after" /></template>
    </VPNavScreen>
  </header>
</template>

<style scoped>
.VPNav {
  position: relative;
  top: var(--vp-layout-top-height, 0px);
  left: 0;
  z-index: var(--vp-z-index-nav);
  width: 100%;
  pointer-events: none;
  transition: background-color 0.5s;
}

@media (min-width: 960px) {
  .VPNav {
    position: fixed;
  }
}

@media (max-width: 959px) {
  .VPNav {
    position: fixed;
  }

  .vp-nav-spacer {
    display: block;
    height: var(--vp-nav-height);
  }
}

@media (min-width: 960px) {
  .vp-nav-spacer {
    display: none;
  }
}
</style>

<style>
@media (max-width: 959px) {
  :root.vp-nav-shown-mobile .VPLocalNav {
    top: var(--vp-nav-height) !important;
  }

  .VPLocalNav {
    transition: top 0.25s ease-in-out !important;
  }
}

/* Keep nav fixed when the mobile menu overlay is open. */
.VPNav:has(.VPNavScreen[style*="display: block"]) {
  transform: none !important;
}
</style>
