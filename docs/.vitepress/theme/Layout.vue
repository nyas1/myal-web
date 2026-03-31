<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import AsideMoreCard from './components/AsideMoreCard.vue'
import BrowseAppsButton from './components/BrowseAppsButton.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-nav-after>
      <AsideMoreCard />
    </template>
    <template #layout-bottom>
      <BrowseAppsButton />
    </template>
  </Layout>
</template>
