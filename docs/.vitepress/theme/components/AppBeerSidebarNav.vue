<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useAppListFilterEffects } from '../composables/useAppListFilters'

useAppListFilterEffects()

const { theme } = useData()
const route = useRoute()

// Collapsible rail: keep BeerCSS layout stable and only hide label spans.
const railExpanded = ref(true)

function toggleRailExpand() {
  railExpanded.value = !railExpanded.value
}

const logoSrc = computed(() => {
  const logo = theme.value.logo
  if (!logo) return ''
  const raw = typeof logo === 'string' ? logo : logo.src
  return raw ? withBase(raw) : ''
})

function normalizePath(path: string) {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

function navLinkActive(rel: string) {
  return normalizePath(route.path) === normalizePath(withBase(rel))
}
</script>

<template>
  <div class="myal-sidebar-rail" :class="{ 'myal-rail-collapsed': !railExpanded }">
    <!-- Desktop: MYAL lives in the sidebar rail; mobile keeps VP top bar (unchanged). -->
    <div class="myal-sidebar-brand myal-sidebar-brand--desktop-only">
      <a class="myal-sidebar-brand-link" :href="withBase('/')" aria-label="MYAL home">
        <img v-if="logoSrc" class="myal-sidebar-brand-logo" :src="logoSrc" alt="" width="62" height="62" decoding="async" />
        <span class="myal-sidebar-brand-text">MYAL</span>
      </a>
    </div>
    <div class="beer myal-app-beer-nav">
      <!-- `max` keeps icon positions stable; we hide label spans via `.myal-rail-collapsed` -->
      <nav class="m l left max" aria-label="Site">
        <button
          type="button"
          class="extra transparent square round myal-rail-toggle"
          :aria-expanded="railExpanded"
          :aria-label="railExpanded ? 'Collapse navigation' : 'Expand navigation'"
          @click="toggleRailExpand"
        >
          <i class="material-icons-outlined" aria-hidden="true">
            {{ railExpanded ? 'chevron_left' : 'chevron_right' }}
          </i>
        </button>

        <a
          :href="withBase('/')"
          :class="{ active: navLinkActive('/') }"
          :aria-current="navLinkActive('/') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">home</i>
          <span>Home</span>
        </a>
        <a
          :href="withBase('/app')"
          :class="{ active: navLinkActive('/app') }"
          :aria-current="navLinkActive('/app') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">apps</i>
          <span>Apps</span>
        </a>
        <a
          :href="withBase('/newly-added-apps')"
          :class="{ active: navLinkActive('/newly-added-apps') }"
          :aria-current="navLinkActive('/newly-added-apps') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">new_releases</i>
          <span>Newly added</span>
        </a>
        <a
          :href="withBase('/changelog')"
          :class="{ active: navLinkActive('/changelog') }"
          :aria-current="navLinkActive('/changelog') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">history</i>
          <span>Changelog</span>
        </a>
        <a
          :href="withBase('/credits')"
          :class="{ active: navLinkActive('/credits') }"
          :aria-current="navLinkActive('/credits') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">volunteer_activism</i>
          <span>Credits</span>
        </a>
        <a
          :href="withBase('/contributing')"
          :class="{ active: navLinkActive('/contributing') }"
          :aria-current="navLinkActive('/contributing') ? 'page' : undefined"
        >
          <i class="material-icons-outlined" aria-hidden="true">lightbulb</i>
          <span>Contribute</span>
        </a>
      </nav>
    </div>
  </div>
</template>
