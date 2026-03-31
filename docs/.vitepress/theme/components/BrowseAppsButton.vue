<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <Transition name="myal-fab">
    <a
      v-if="frontmatter.layout === 'home'"
      href="/app"
      class="myal-browse-fab"
      aria-label="Browse Apps"
    >
      <span class="myal-browse-fab-icon material-icons-outlined" aria-hidden="true">apps</span>
      Browse Apps
    </a>
  </Transition>
</template>
