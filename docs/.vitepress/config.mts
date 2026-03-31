import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { meta, nav, sidebar, socialLinks } from './shared'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/'

export default defineConfig({
  base: pagesBase,
  title: 'Material You App List',
  description: meta.description,
  lang: 'en-US',
  cleanUrls: true,
  appearance: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/icon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined' }],
    ['meta', { name: 'application-name', content: meta.name }],
    ['meta', { property: 'og:site_name', content: meta.name }],
    ['meta', { name: 'apple-mobile-web-app-title', content: meta.name }]
  ],
  themeConfig: {
    logo: {
      src: '/icon.svg',
      alt: 'Material You'
    },
    nav,
    sidebar,
    outline: 'deep',
    socialLinks,
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/nyas1/Material-You-app-list/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*VPNav\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/VPNav.vue', import.meta.url)
          )
        }
      ]
    },
    server: {
      host: true
    }
  },
  srcExclude: ['README.md']
})
