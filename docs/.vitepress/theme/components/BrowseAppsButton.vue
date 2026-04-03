<script setup lang="ts">
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <Transition name="myal-fab">
    <div
      v-if="frontmatter.layout === 'home'"
      class="beer myal-browse-apps-beer"
    >
      <a
        class="button elevate myal-browse-apps-link"
        :href="withBase('/app')"
        aria-label="Browse Apps"
      >
        <i class="material-icons-outlined" aria-hidden="true">apps</i>
        <span>Browse Apps</span>
      </a>
    </div>
  </Transition>
</template>
