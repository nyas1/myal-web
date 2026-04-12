<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import AppBeerSidebarNav from './components/AppBeerSidebarNav.vue'
import AsideMoreCard from './components/AsideMoreCard.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import MobileFabCluster from './components/MobileFabCluster.vue'
import NavBarTocDropdown from './components/NavBarTocDropdown.vue'

const { Layout } = DefaultTheme
const { page } = useData()
const isAppPage = computed(() => page.value.relativePath === 'app.md')

/** Used in `style.css` for `::before` — plain `url(/...)` ignores VitePress `base`. */
/** No query string: must match precached `hero-android.svg` URL so the PWA SW can serve it offline. */
const heroAndroidBg = computed(() => `url('${withBase('/hero-android.svg')}')`)
</script>

<template>
  <Layout>
    <template #nav-bar-content-before>
      <NavBarTocDropdown />
    </template>
    <template #sidebar-nav-before>
      <AppBeerSidebarNav />
    </template>
    <template #sidebar-nav-after>
      <AsideMoreCard />
    </template>
    <template #layout-bottom>
      <MobileBottomNav />
      <MobileFabCluster v-if="isAppPage" />
    </template>
  </Layout>
</template>

<style>
:root {
  --myal-hero-android-bg: v-bind(heroAndroidBg);
}
</style>
