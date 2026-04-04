<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  fossOnly,
  hideArchived,
  showMD3E,
  showMDY,
  showMD,
  showMY
} from '../composables/useAppListFilters'

const panelOpen = ref(false)
const filtersExpanded = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function togglePanel(ev: Event) {
  ev.stopPropagation()
  panelOpen.value = !panelOpen.value
  if (!panelOpen.value) filtersExpanded.value = false
}

function toggleFilters(ev: Event) {
  ev.stopPropagation()
  filtersExpanded.value = !filtersExpanded.value
}

function scrollToTop(ev: Event) {
  ev.stopPropagation()
  const vp = document.querySelector('.VPContent') as HTMLElement | null
  if (vp) {
    const oy = getComputedStyle(vp).overflowY
    if (
      (oy === 'auto' || oy === 'scroll') &&
      vp.scrollHeight > vp.clientHeight + 2
    ) {
      vp.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }
  ;(document.scrollingElement ?? document.documentElement).scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function onGlobalPointerDown(ev: PointerEvent) {
  if (!panelOpen.value) return
  const t = ev.target as Node
  if (rootRef.value?.contains(t)) return
  panelOpen.value = false
  filtersExpanded.value = false
}

onMounted(() => document.addEventListener('pointerdown', onGlobalPointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', onGlobalPointerDown))
</script>

<template>
  <div ref="rootRef" class="myal-speed-dial">
    <button
      type="button"
      class="square round extra no-wave myal-speed-dial-trigger"
      :aria-expanded="panelOpen"
      aria-haspopup="true"
      aria-label="Shortcuts menu"
      @click="togglePanel"
    >
      <i class="material-icons-outlined" aria-hidden="true">{{
        panelOpen ? 'close' : 'north_west'
      }}</i>
    </button>
    <div
      v-show="panelOpen"
      class="myal-speed-dial-toolbar"
      role="toolbar"
      aria-label="App list shortcuts"
    >
      <button
        type="button"
        :class="['chip', 'no-wave', 'myal-speed-dial-toolbar-chip', { round: filtersExpanded }]"
        :aria-pressed="filtersExpanded"
        aria-label="Toggle filter options"
        @click.stop="toggleFilters"
      >
        <i class="material-icons-outlined" aria-hidden="true">tune</i>
        <span>Filters</span>
      </button>
      <button
        type="button"
        class="chip no-wave myal-speed-dial-toolbar-chip"
        aria-label="Scroll to top"
        @click.stop="scrollToTop"
      >
        <i class="material-icons-outlined" aria-hidden="true">vertical_align_top</i>
        <span>Top</span>
      </button>
    </div>
    <div
      v-show="panelOpen && filtersExpanded"
      class="myal-speed-dial-chips"
      role="group"
      aria-label="App list filters"
      @click.stop
    >
      <div class="myal-speed-dial-row">
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--wide', { round: fossOnly }]"
          :aria-pressed="fossOnly"
          @click.stop="fossOnly = !fossOnly"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            fossOnly ? 'done' : 'close'
          }}</i>
          <span>FOSS Only</span>
        </button>
      </div>
      <div class="myal-speed-dial-row">
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--wide', { round: hideArchived }]"
          :aria-pressed="hideArchived"
          @click.stop="hideArchived = !hideArchived"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            hideArchived ? 'done' : 'close'
          }}</i>
          <span>Hide archived</span>
        </button>
      </div>
      <div class="myal-speed-dial-row myal-speed-dial-row--quad">
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--pill', { round: showMD3E }]"
          :aria-pressed="showMD3E"
          @click.stop="showMD3E = !showMD3E"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            showMD3E ? 'done' : 'close'
          }}</i>
          <span>MD3E</span>
        </button>
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--pill', { round: showMDY }]"
          :aria-pressed="showMDY"
          @click.stop="showMDY = !showMDY"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            showMDY ? 'done' : 'close'
          }}</i>
          <span>MDY</span>
        </button>
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--pill', { round: showMD }]"
          :aria-pressed="showMD"
          @click.stop="showMD = !showMD"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            showMD ? 'done' : 'close'
          }}</i>
          <span>MD</span>
        </button>
        <button
          type="button"
          :class="['chip', 'no-wave', 'myal-speed-dial-chip--pill', { round: showMY }]"
          :aria-pressed="showMY"
          @click.stop="showMY = !showMY"
        >
          <i class="material-icons-outlined" aria-hidden="true">{{
            showMY ? 'done' : 'close'
          }}</i>
          <span>MY</span>
        </button>
      </div>
    </div>
  </div>
</template>
