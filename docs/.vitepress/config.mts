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
    ['link', { rel: 'apple-touch-icon', href: '/icon.svg' }]
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
    footer: {
      message: 'Community maintained',
      copyright: `© ${new Date().getFullYear()} Material You App List`
    }
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
