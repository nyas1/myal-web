<script setup lang="ts">
function openLocalSearch() {
  const btn = document.querySelector<HTMLButtonElement>('#local-search .DocSearch-Button')
  if (btn) {
    btn.click()
    return
  }
  const mac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform ?? navigator.userAgent)
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: !mac,
      metaKey: mac,
      bubbles: true,
      cancelable: true
    })
  )
}
</script>

<template>
  <button
    type="button"
    class="square round extra no-wave myal-search-fab"
    aria-label="Search"
    @click="openLocalSearch()"
  >
    <i class="material-icons-outlined" aria-hidden="true">search</i>
  </button>
</template>
