import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { MYAL_MOBILE_NAV_CHROME } from './chrome'
import { meta, nav, sidebar, socialLinks } from './shared'
import { vitepressSidebarOverridePlugin } from './theme/vitepress-sidebar-plugin'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/'

const googleSansFlexStylesheet =
  'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,0..100&display=swap'

/** Public dir URLs (respect `base`); use for `head` — theme `logo` / markdown stay `/file.svg` so VPImage applies `withBase`. */
function publicUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  return `${pagesBase}${normalized}`
}

/** VP merges `head` late; inject `theme-color` right after viewport (build via transformHtml, dev via plugin). */
const EARLY_CHROME_MARKER = '<!--myal:early-chrome-->'

function injectEarlyChromeMeta(html: string): string {
  if (html.includes(EARLY_CHROME_MARKER)) return html
  const block = `\n    ${EARLY_CHROME_MARKER}\n    <meta name="color-scheme" content="dark">\n    <meta name="theme-color" content="${MYAL_MOBILE_NAV_CHROME}">\n    <meta name="theme-color" media="(prefers-color-scheme: light)" content="${MYAL_MOBILE_NAV_CHROME}">\n    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="${MYAL_MOBILE_NAV_CHROME}">`
  return html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1${block}`)
}

export default defineConfig({
  base: pagesBase,
  title: 'MYAL',
  description: meta.description,
  lang: 'en-US',
  cleanUrls: true,
  appearance: 'force-dark',
  lastUpdated: false,
  transformHtml(html) {
    return injectEarlyChromeMeta(html)
  },
  head: [
    ['script', {}, `(() => {
      const key = 'vitepress-theme-appearance'
      try { localStorage.setItem(key, 'dark') } catch {}
      const root = document.documentElement
      root.classList.remove('light')
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    })();`],
    ['link', { rel: 'icon', href: publicUrl('icon.svg'), type: 'image/svg+xml' }],
    ['link', { rel: 'manifest', href: publicUrl('site.webmanifest') }],
    ['link', { rel: 'apple-touch-icon', href: publicUrl('icon.svg') }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: googleSansFlexStylesheet }],
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
    docFooter: {
      prev: false,
      next: false
    },
    socialLinks,
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    }
  },
  vite: {
    plugins: [
      vitepressSidebarOverridePlugin(),
      {
        name: 'myal-early-chrome',
        transformIndexHtml(html) {
          return injectEarlyChromeMeta(html)
        }
      }
    ],
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
