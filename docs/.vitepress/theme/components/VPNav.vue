<script setup lang="ts">
import { useData, inBrowser } from 'vitepress'
import { computed, provide, watchEffect, ref, watch, onMounted, onUnmounted } from 'vue'
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

const isHidden = ref(false)
const lastY = ref(0)
const SCROLL_DELTA_THRESHOLD = 2
const isCoarsePointer = () => window.matchMedia('(hover: none), (pointer: coarse)').matches

const updateMobileNavClass = (hidden: boolean) => {
  if (!inBrowser) return
  if (hidden) {
    document.documentElement.classList.remove('vp-nav-shown-mobile')
  } else {
    document.documentElement.classList.add('vp-nav-shown-mobile')
  }
}

const syncByScroll = () => {
  if (!inBrowser) return

  const y = window.scrollY || window.pageYOffset || 0
  const width = window.innerWidth
  const deltaY = y - lastY.value

  // On touch devices, keep nav fixed and stable.
  if (isCoarsePointer()) {
    isHidden.value = false
    updateMobileNavClass(false)
    lastY.value = y
    return
  }

  if (y <= 0) {
    isHidden.value = false
    updateMobileNavClass(false)
    lastY.value = y
    return
  }

  if (width < 960) {
    // Ignore tiny/no-op scroll deltas caused by mobile viewport resize jitter.
    if (Math.abs(deltaY) < SCROLL_DELTA_THRESHOLD) {
      return
    }

    if (deltaY > 0) {
      isHidden.value = true
      updateMobileNavClass(true)
    } else {
      isHidden.value = false
      updateMobileNavClass(false)
    }
  } else {
    isHidden.value = false
    updateMobileNavClass(false)
  }

  lastY.value = y
}

const onScroll = () => {
  syncByScroll()
}

const onResize = () => {
  if (!inBrowser) return

  // Mobile browsers can emit resize events while touching/zooming or when
  // the URL bar collapses/expands. Do not toggle nav visibility from resize.
  if (window.innerWidth >= 960) {
    isHidden.value = false
    updateMobileNavClass(false)
  }
}

watch(isScreenOpen, (open) => {
  if (open) {
    isHidden.value = false
    updateMobileNavClass(false)
  }
})

onMounted(() => {
  if (!inBrowser) return
  lastY.value = window.scrollY || window.pageYOffset || 0
  updateMobileNavClass(false)
  if (isCoarsePointer()) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (!inBrowser) return
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div v-if="hasNavbar" class="vp-nav-spacer"></div>

  <header v-if="hasNavbar" class="VPNav" :class="{ 'nav-hidden': isHidden }">
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
  transition: background-color 0.5s, transform 0.25s ease-in-out;
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

  .VPNav.nav-hidden {
    transform: translateY(-100%);
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
