<script setup lang="ts">
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
</script>

<template>
  <button
    type="button"
    class="square round extra no-wave myal-top-fab"
    aria-label="Scroll to top"
    @click="scrollToTop"
  >
    <i class="material-icons-outlined" aria-hidden="true">vertical_align_top</i>
  </button>
</template>
