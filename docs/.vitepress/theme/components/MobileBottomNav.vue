<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const route = useRoute()
const { frontmatter } = useData()

const showBar = computed(() => frontmatter.value.layout !== 'home')

const items = [
  { rel: '/', label: 'Home', icon: 'home' },
  { rel: '/app', label: 'Apps', icon: 'apps' },
  { rel: '/newly-added-apps', label: 'New', icon: 'new_releases' },
  { rel: '/changelog', label: 'Changelog', icon: 'history' }
] as const

function normalizePath(path: string) {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

function navLinkActive(rel: string) {
  return normalizePath(route.path) === normalizePath(withBase(rel))
}
</script>

<template>
  <div v-if="showBar" class="beer myal-mobile-bottom-wrap">
    <nav class="bottom myal-mobile-bottom-nav" aria-label="Primary">
      <a
        v-for="item in items"
        :key="item.rel"
        :href="withBase(item.rel)"
        :class="{ active: navLinkActive(item.rel) }"
        :aria-current="navLinkActive(item.rel) ? 'page' : undefined"
      >
        <i class="material-icons-outlined" aria-hidden="true">{{ item.icon }}</i>
        <span class="myal-mobile-bottom-label">{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>
