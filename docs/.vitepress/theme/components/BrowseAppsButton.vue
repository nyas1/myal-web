<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()

/** Hide as soon as the user leaves for /app so the FAB doesn’t wait on route + frontmatter. */
const dismissed = ref(false)

const showFab = computed(() => frontmatter.value.layout === 'home' && !dismissed.value)

watch(
  () => frontmatter.value.layout,
  (layout) => {
    if (layout === 'home') dismissed.value = false
  }
)

function onBrowseAppsClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  dismissed.value = true
}
</script>

<template>
  <Transition name="myal-fab">
    <div v-if="showFab" class="beer myal-browse-apps-beer">
      <a
        class="button elevate myal-browse-apps-link"
        :href="withBase('/app')"
        aria-label="Browse Apps"
        @click="onBrowseAppsClick"
      >
        <span class="myal-browse-apps-icon-wrap" aria-hidden="true">
          <i class="material-icons-outlined">apps</i>
        </span>
        <span class="myal-browse-apps-label">Browse Apps</span>
      </a>
    </div>
  </Transition>
</template>
