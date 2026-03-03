<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import AsideMoreCard from './components/AsideMoreCard.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-nav-after>
      <AsideMoreCard />
    </template>
  </Layout>
</template>
