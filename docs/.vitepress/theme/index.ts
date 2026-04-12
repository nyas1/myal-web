import type { Theme } from 'vitepress'
// Default theme without bundled Inter; Google Sans Flex is linked in config.mts head.
import DefaultTheme from 'vitepress/theme-without-fonts'
import { inject } from '@vercel/analytics'
import twemoji from 'twemoji'
import Layout from './Layout.vue'
import './style.css'

let beercssClientLoaded = false

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const applyDarkToElement = (element: HTMLElement | null) => {
      if (!element) return
      element.classList.remove('light')
      element.classList.add('dark')
      element.style.colorScheme = 'dark'
    }

    // Force a single theme mode (dark) regardless of OS/browser preference.
    // Hydration-safe: touch <html> always; touch <body> only after hydration.
    const enforceDarkTheme = () => {
      applyDarkToElement(root)
      applyDarkToElement(document.body)
      try {
        localStorage.setItem('vitepress-theme-appearance', 'dark')
      } catch {
        // Ignore storage errors (private mode / disabled storage).
      }
    }
    let themeObserver: MutationObserver | null = null
    const startThemeEnforcer = () => {
      enforceDarkTheme()
      if (themeObserver) return
      // Re-apply if any script/plugin mutates theme classes/styles after hydration.
      themeObserver = new MutationObserver(() => {
        if (!root.classList.contains('dark') || root.classList.contains('light')) {
          enforceDarkTheme()
        }
      })
      themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ['class', 'style']
      })
      window.addEventListener('pagehide', () => themeObserver?.disconnect(), { once: true })
    }

    // Beercss "scoped" scopes component styles under `.beer`; the bundle may still
    // ship a few global :root/html/body rules—keep Beer UI markup inside `.beer`.
    if (!beercssClientLoaded) {
      beercssClientLoaded = true
      void import('beercss/scoped')
    }

    const analyticsWindow = window as Window & { __myalVercelAnalyticsInitialized?: boolean }
    if (!analyticsWindow.__myalVercelAnalyticsInitialized) {
      inject()
      analyticsWindow.__myalVercelAnalyticsInitialized = true
    }

    let cleanupTocSync: (() => void) | null = null
    let cleanupTwemojiObserver: (() => void) | null = null

    const isHomeRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '')
      return path === '' || path === '/'
    }

    /** Body hook for home-only hero chrome (stacking + Android watermark in CSS). */
    const syncHomeBodyClass = () => {
      document.body.classList.toggle('myal-home-page', isHomeRoute())
    }

    const emojiPattern = (() => {
      try {
        return /[\p{Extended_Pictographic}\uFE0F]/u
      } catch {
        return /[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]/
      }
    })()

    const nodeHasEmoji = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        return emojiPattern.test(node.textContent ?? '')
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return false
      const element = node as Element
      if (element.tagName === 'IMG' && element.classList.contains('emoji')) return false
      return emojiPattern.test(element.textContent ?? '')
    }

    const applyTwemoji = (target: Node = document.body) => {
      if (target.nodeType === Node.ELEMENT_NODE) {
        const element = target as Element
        if (element.tagName === 'IMG' && element.classList.contains('emoji')) return
      }

      twemoji.parse(target, {
        folder: 'svg',
        ext: '.svg'
      })
    }

    const setupTwemojiObserver = () => {
      cleanupTwemojiObserver?.()
      cleanupTwemojiObserver = null

      /** Double rAF: Vue often patches the DOM across frames; one rAF can re-parse before markup settles. */
      let rafOuter = 0
      let rafInner = 0
      const pendingTargets = new Set<Node>()
      const queueParse = () => {
        if (rafOuter) return
        rafOuter = window.requestAnimationFrame(() => {
          rafOuter = 0
          rafInner = window.requestAnimationFrame(() => {
            rafInner = 0
            const targets = Array.from(pendingTargets)
            pendingTargets.clear()
            if (targets.length === 0) return
            targets.forEach((target) => applyTwemoji(target))
          })
        })
      }

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            if (mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                if (!nodeHasEmoji(node)) continue
                pendingTargets.add(node.nodeType === Node.TEXT_NODE ? mutation.target : node)
              }
            }
            continue
          }

          if (mutation.type === 'characterData') {
            if (!nodeHasEmoji(mutation.target)) continue
            pendingTargets.add(mutation.target.parentNode ?? mutation.target)
          }
        }

        if (pendingTargets.size > 0) queueParse()
      })

      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      })

      cleanupTwemojiObserver = () => {
        observer.disconnect()
        if (rafOuter) window.cancelAnimationFrame(rafOuter)
        if (rafInner) window.cancelAnimationFrame(rafInner)
        pendingTargets.clear()
      }
    }

    /** Full-body parse only once; re-parsing chrome on every route tears down Twemoji imgs and makes them “reload”. */
    const applyTwemojiAfterRouteChange = () => {
      const roots: (Element | null)[] = [
        document.querySelector('#VPContent'),
        document.querySelector('.VPDocAsideOutline')
      ]
      for (const el of roots) {
        if (el) applyTwemoji(el)
      }
    }

    const applyTocToggle = () => {
      cleanupTocSync?.()
      cleanupTocSync = null

      const root = document.querySelector('.VPDocAsideOutline .root')
      if (!(root instanceof HTMLElement)) return

      const topLevelItems = Array.from(root.children).filter(
        (item): item is HTMLLIElement => item instanceof HTMLLIElement
      )
      const parentItems = topLevelItems.filter((item) => item.querySelector(':scope > ul'))

      parentItems.forEach((item) => item.classList.remove('toc-open'))

      const activeParent = parentItems.find((item) => item.querySelector(':scope > ul .outline-link.active'))
      if (activeParent) {
        activeParent.classList.add('toc-open')
      }

      let suppressAutoSync = false

      const syncActiveParent = () => {
        if (suppressAutoSync) return

        const currentActiveParent = parentItems.find((item) => item.querySelector(':scope > ul .outline-link.active'))
        if (!currentActiveParent) return

        parentItems.forEach((item) => {
          item.classList.toggle('toc-open', item === currentActiveParent)
        })
      }

      const ensureActiveLinkVisible = () => {
        const outline = document.querySelector('.VPDocAsideOutline')
        if (!(outline instanceof HTMLElement)) return

        const activeLink = outline.querySelector('.outline-link.active')
        if (!(activeLink instanceof HTMLElement)) return

        const scrollContainer = outline.closest('.aside-container')
        if (!(scrollContainer instanceof HTMLElement)) return

        const containerRect = scrollContainer.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()

        const topPadding = 16
        const bottomPadding = 20
        const isAbove = linkRect.top < containerRect.top + topPadding
        const isBelow = linkRect.bottom > containerRect.bottom - bottomPadding

        if (isAbove || isBelow) {
          const currentTop = scrollContainer.scrollTop
          const delta = linkRect.top - containerRect.top
          const targetTop = Math.max(0, currentTop + delta - scrollContainer.clientHeight * 0.35)
          scrollContainer.scrollTo({ top: targetTop, behavior: 'auto' })
        }
      }

      parentItems.forEach((item) => {
        const link = item.querySelector(':scope > .outline-link')
        if (!(link instanceof HTMLAnchorElement)) return
        if (link.dataset.tocToggleBound === '1') return

        link.dataset.tocToggleBound = '1'
        link.addEventListener('click', (event) => {
          const isOpen = item.classList.contains('toc-open')
          const isSameHash = window.location.hash === link.hash

          if (isOpen && isSameHash) {
            event.preventDefault()
            item.classList.remove('toc-open')
            suppressAutoSync = true
            return
          }

          suppressAutoSync = false
          parentItems.forEach((parent) => {
            if (parent !== item) {
              parent.classList.remove('toc-open')
            }
          })
          item.classList.add('toc-open')
        })
      })

      let ticking = false
      const onScroll = () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => {
          if (suppressAutoSync) {
            suppressAutoSync = false
          }
          syncActiveParent()
          ensureActiveLinkVisible()
          ticking = false
        })
      }

      const onHashChange = () => {
        syncActiveParent()
        ensureActiveLinkVisible()
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('hashchange', onHashChange)
      syncActiveParent()
      ensureActiveLinkVisible()

      cleanupTocSync = () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('hashchange', onHashChange)
      }
    }

    const runAfterHydrationPaint = (fn: () => void) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(fn)
      })
    }

    const updateSyncBadge = () => {
      if (!isHomeRoute()) return

      const epoch = Number((router.route.data.frontmatter as any)?.syncLastEpoch ?? 0)
      if (!Number.isFinite(epoch) || epoch <= 0) return

      const now = Date.now()
      const diffMs = Math.max(0, now - epoch * 1000)
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      let label = 'Synced just now'

      if (diffMs >= day) {
        const days = Math.floor(diffMs / day)
        label = `Synced ${days} day${days === 1 ? '' : 's'} ago`
      } else if (diffMs >= hour) {
        const hours = Math.floor(diffMs / hour)
        label = `Synced ${hours} hour${hours === 1 ? '' : 's'} ago`
      } else if (diffMs >= minute) {
        const minutes = Math.floor(diffMs / minute)
        label = `Synced ${minutes} min${minutes === 1 ? '' : 's'} ago`
      }

      const link = document.querySelector<HTMLAnchorElement>('.VPHomeHero .actions a[href="/changelog"]')
      if (link) {
        link.textContent = label
      }
    }

    const runPostHydrationEffects = (afterRouteChange: boolean) => {
      startThemeEnforcer()
      if (afterRouteChange) {
        applyTwemojiAfterRouteChange()
      } else {
        applyTwemoji()
      }
      setupTwemojiObserver()
      applyTocToggle()
      syncHomeBodyClass()
      updateSyncBadge()
    }

    runAfterHydrationPaint(() => runPostHydrationEffects(false))
    router.onAfterRouteChanged = () => {
      runAfterHydrationPaint(() => runPostHydrationEffects(true))
    }
  }
} satisfies Theme
