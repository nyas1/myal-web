<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { useLocalNav, useSidebar } from 'vitepress/theme'
import VPLocalNavOutlineDropdown from 'vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue'

const { frontmatter } = useData()
const { headers } = useLocalNav()
const { hasSidebar } = useSidebar()

const navHeight = ref(64)

onMounted(() => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height').trim()
  const n = parseInt(raw, 10)
  navHeight.value = Number.isFinite(n) ? n : 64
})
</script>

<template>
  <div
    v-if="hasSidebar && frontmatter.layout !== 'home'"
    class="myal-nav-bar-outline--desktop-mid"
  >
    <VPLocalNavOutlineDropdown :headers="headers" :nav-height="navHeight" />
  </div>
</template>
