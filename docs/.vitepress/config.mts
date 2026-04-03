import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { meta, nav, sidebar, socialLinks } from './shared'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/'

/** Public dir URLs (respect `base`); use for `head` — theme `logo` / markdown stay `/file.svg` so VPImage applies `withBase`. */
function publicUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  return `${pagesBase}${normalized}`
}

export default defineConfig({
  base: pagesBase,
  title: 'MYAL',
  description: meta.description,
  lang: 'en-US',
  cleanUrls: true,
  appearance: 'force-dark',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: publicUrl('icon.svg'), type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: publicUrl('icon.svg') }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&display=swap' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined' }],
    ['meta', { name: 'application-name', content: meta.name }],
    ['meta', { property: 'og:site_name', content: meta.name }],
    ['meta', { name: 'apple-mobile-web-app-title', content: meta.name }]
  ],
  themeConfig: {
    logo: {
      src: '/icon.svg',
      alt: 'MYAL'
    },
    nav,
    sidebar,
    outline: {
      level: 'deep',
      label: 'Table of contents'
    },
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
        },
        {
          find: /^.*VPFeature\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/VPFeature.vue', import.meta.url)
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
