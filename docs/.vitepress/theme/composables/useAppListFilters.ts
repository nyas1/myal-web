import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

export const fossOnly = ref(false)
export const hideArchived = ref(false)
export const showMD3E = ref(true)
export const showMDY = ref(true)
export const showMD = ref(true)
export const showMY = ref(true)

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
  return /🪦/.test(lineText) || html.includes('alt="🪦"') || /1fae6\.svg/i.test(html)
}

function applyAppListFilters(isAppPage: boolean) {
  if (typeof document === 'undefined') return

  const allTagsEnabled = showMD3E.value && showMDY.value && showMD.value && showMY.value

  if (!isAppPage || (!fossOnly.value && !hideArchived.value && allTagsEnabled)) {
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

/** Call once from a component that is always mounted (e.g. MobileFabCluster). */
export function useAppListFilterEffects() {
  const route = useRoute()
  const { page } = useData()
  const isAppPage = computed(() => page.value.relativePath === 'app.md')

  onMounted(async () => {
    fossOnly.value = false
    hideArchived.value = false
    showMD3E.value = true
    showMDY.value = true
    showMD.value = true
    showMY.value = true
    await nextTick()
    applyAppListFilters(isAppPage.value)
  })

  watch([fossOnly, hideArchived, showMD3E, showMDY, showMD, showMY], async () => {
    await nextTick()
    applyAppListFilters(isAppPage.value)
  })

  watch(
    () => route.path,
    async () => {
      await nextTick()
      applyAppListFilters(isAppPage.value)
    }
  )
}
