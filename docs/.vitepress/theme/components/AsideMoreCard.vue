<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'


const route = useRoute()
const { page } = useData()
const fossOnly = ref(false)
const hideArchived = ref(false)
const showMD3E = ref(true)
const showMDY = ref(true)
const showMD = ref(true)
const showMY = ref(true)

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
  return /^(MD3E|MDY|MD|MY)\b/i.test(line)
}

function getPrimaryTag(line: string) {
  const match = line.match(/^(MD3E|MDY|MD|MY)\b/i)
  return match ? match[1].toUpperCase() : null
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

  const allTagsEnabled = showMD3E.value && showMDY.value && showMD.value && showMY.value

  if (!isAppPage.value || (!fossOnly.value && !hideArchived.value && allTagsEnabled)) {
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

    const primaryTag = getPrimaryTag(text)
    const hasFoss = /\bFOSS\b/i.test(text)
    const isArchived = isArchivedEntry(element, text)
    const hiddenByTag =
      (primaryTag === 'MD3E' && !showMD3E.value) ||
      (primaryTag === 'MDY' && !showMDY.value) ||
      (primaryTag === 'MD' && !showMD.value) ||
      (primaryTag === 'MY' && !showMY.value)

    const hiddenByFoss = fossOnly.value && !hasFoss
    const hiddenByArchived = hideArchived.value && isArchived

    element.classList.toggle('myal-filter-hidden', hiddenByTag || hiddenByFoss || hiddenByArchived)
  })
}

onMounted(async () => {
  // Option toggles intentionally reset on reload.
  fossOnly.value = false
  hideArchived.value = false
  // Tag filters intentionally reset on reload.
  showMD3E.value = true
  showMDY.value = true
  showMD.value = true
  showMY.value = true
  await nextTick()
  applyFilters()
})

watch([fossOnly, hideArchived, showMD3E, showMDY, showMD, showMY], async () => {
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
        <span>Hide archived</span>
        <span class="myal-switch">
          <input id="hide-archived-toggle" v-model="hideArchived" type="checkbox">
          <span class="myal-switch-thumb" aria-hidden="true"></span>
        </span>
      </label>
      <div class="myal-options-title">Tag filters</div>
      <div class="myal-tag-filter-grid">
        <label class="myal-checkbox-row" for="tag-md3e-toggle">
          <span>MD3E</span>
          <input id="tag-md3e-toggle" v-model="showMD3E" type="checkbox">
        </label>
        <label class="myal-checkbox-row" for="tag-mdy-toggle">
          <span>MDY</span>
          <input id="tag-mdy-toggle" v-model="showMDY" type="checkbox">
        </label>
        <label class="myal-checkbox-row" for="tag-md-toggle">
          <span>MD</span>
          <input id="tag-md-toggle" v-model="showMD" type="checkbox">
        </label>
        <label class="myal-checkbox-row" for="tag-my-toggle">
          <span>MY</span>
          <input id="tag-my-toggle" v-model="showMY" type="checkbox">
        </label>
      </div>
    </div>
  </section>
</template>
