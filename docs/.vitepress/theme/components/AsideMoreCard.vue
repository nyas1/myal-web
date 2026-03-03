<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const FOSS_STORAGE_KEY = 'myal-foss-only'
const ARCHIVED_STORAGE_KEY = 'myal-hide-archived'

const route = useRoute()
const { page } = useData()
const fossOnly = ref(false)
const hideArchived = ref(false)

const isAppPage = computed(() => page.value.relativePath === 'app.md')

const tagLegend = [
  { tag: 'MD3E', description: 'Material Design 3 Expressive' },
  { tag: 'MDY', description: 'Material Design + Material You' },
  { tag: 'MD', description: 'Material Design support' },
  { tag: 'MY', description: 'Material You theming support' },
  { tag: 'FOSS', description: 'Free and open-source software' },
  { tag: 'FORK', description: 'Community fork of another app' },
  { tag: 'PORT', description: 'Port from another source/device' },
  { tag: 'MOD', description: 'Modified app build' },
  { tag: '🪦', description: 'Discontinued or no longer maintained' },
  { tag: '⚠️', description: 'Needs additional setup or caution' }
]

function clearFilters() {
  const hiddenItems = document.querySelectorAll('.vp-doc li.myal-filter-hidden')
  hiddenItems.forEach((item) => item.classList.remove('myal-filter-hidden'))
}

function isTaggedAppEntry(line: string) {
  return /^(MD3E|MDY|MD|MY|MOD)\b/i.test(line)
}

function isArchivedEntry(element: HTMLLIElement, lineText: string) {
  const html = element.innerHTML
  return (
    /🪦/.test(lineText) ||
    html.includes('alt="🪦"') ||
    /1fae6\.svg/i.test(html)
  )
}

function applyFilters() {
  if (typeof document === 'undefined') return

  if (!isAppPage.value || (!fossOnly.value && !hideArchived.value)) {
    clearFilters()
    return
  }

  const items = document.querySelectorAll('.vp-doc li')

  items.forEach((item) => {
    const element = item as HTMLLIElement
    const text = (element.textContent ?? '').trim()

    if (!isTaggedAppEntry(text)) {
      element.classList.remove('myal-filter-hidden')
      return
    }

    const hasFoss = /\bFOSS\b/i.test(text)
    const isArchived = isArchivedEntry(element, text)

    const hiddenByFoss = fossOnly.value && !hasFoss
    const hiddenByArchived = hideArchived.value && isArchived

    element.classList.toggle('myal-filter-hidden', hiddenByFoss || hiddenByArchived)
  })
}

onMounted(async () => {
  fossOnly.value = localStorage.getItem(FOSS_STORAGE_KEY) === '1'
  hideArchived.value = localStorage.getItem(ARCHIVED_STORAGE_KEY) === '1'
  await nextTick()
  applyFilters()
})

watch([fossOnly, hideArchived], async ([fossEnabled, archivedEnabled]) => {
  localStorage.setItem(FOSS_STORAGE_KEY, fossEnabled ? '1' : '0')
  localStorage.setItem(ARCHIVED_STORAGE_KEY, archivedEnabled ? '1' : '0')
  await nextTick()
  applyFilters()
})

watch(
  () => route.path,
  async () => {
    await nextTick()
    applyFilters()
  }
)
</script>

<template>
  <section v-if="isAppPage" class="myal-more-card">
    <h3 class="myal-more-title">More</h3>

    <div class="myal-legend-panel">
      <details class="myal-legend-details">
        <summary>Tag Legend</summary>
        <ul>
          <li v-for="item in tagLegend" :key="item.tag">
            <span class="myal-tag">{{ item.tag }}</span>
            <span>{{ item.description }}</span>
          </li>
        </ul>
      </details>

      <div class="myal-options-title">Options</div>
      <label class="myal-toggle-row" for="foss-only-toggle">
        <span>Toggle FOSS</span>
        <span class="myal-switch">
          <input id="foss-only-toggle" v-model="fossOnly" type="checkbox">
          <span class="myal-switch-thumb" aria-hidden="true"></span>
        </span>
      </label>
      <label class="myal-toggle-row" for="hide-archived-toggle">
        <span>Toggle Archived</span>
        <span class="myal-switch">
          <input id="hide-archived-toggle" v-model="hideArchived" type="checkbox">
          <span class="myal-switch-thumb" aria-hidden="true"></span>
        </span>
      </label>
    </div>
  </section>
</template>
