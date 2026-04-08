<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import {
  fossOnly,
  hideArchived,
  showMD3E,
  showMDY,
  showMD,
  showMY
} from '../composables/useAppListFilters'
import { appListTagLegend } from '../composables/appListTagLegend'

const { page } = useData()
const isAppPage = computed(() => page.value.relativePath === 'app.md')
</script>

<template>
  <div v-if="isAppPage" class="beer myal-beer-scope">
  <section class="myal-more-card">
    <h3 class="myal-more-title">More</h3>

    <div class="myal-legend-panel">
      <details class="myal-legend-details">
        <summary>Tag Legend</summary>
        <ul>
          <li v-for="item in appListTagLegend" :key="item.tag">
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
  </div>
</template>
