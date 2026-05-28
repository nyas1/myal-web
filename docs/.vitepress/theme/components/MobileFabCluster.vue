<script setup lang="ts">
import MobileSpeedDialFab from './MobileSpeedDialFab.vue'
import MobileTopFab from './MobileTopFab.vue'
import MobileSearchFab from './MobileSearchFab.vue'
</script>

<template>
  <div class="beer myal-mobile-fab-cluster">
    <div class="myal-speed-dial-row-container">
      <MobileSpeedDialFab class="myal-speed-dial--double-width" />
      <MobileTopFab />
    </div>
    <MobileSearchFab />
  </div>
</template>
