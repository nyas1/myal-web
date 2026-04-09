import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
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
    const enforceDarkTheme = () => {
      applyDarkToElement(root)
      applyDarkToElement(document.body)
      try {
        localStorage.setItem('vitepress-theme-appearance', 'dark')
      } catch {
        // Ignore storage errors (private mode / disabled storage).
      }
    }
    enforceDarkTheme()

    // Re-apply if any script/plugin mutates theme classes/styles after hydration.
    const themeObserver = new MutationObserver(() => {
      if (!root.classList.contains('dark') || root.classList.contains('light')) {
        enforceDarkTheme()
      }
    })
    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    window.addEventListener('pagehide', () => themeObserver.disconnect(), { once: true })

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

    let cleanupHomeGrid: (() => void) | null = null
    let cleanupTocSync: (() => void) | null = null
    let cleanupTwemojiObserver: (() => void) | null = null

    const isHomeRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '')
      return path === '' || path === '/'
    }

    const syncHomePageClass = () => {
      document.body.classList.toggle('myal-home-grid-page', isHomeRoute())
    }

    const setupHomeGrid = () => {
      cleanupHomeGrid?.()
      cleanupHomeGrid = null

      if (!isHomeRoute()) return
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

      const canvas = document.createElement('canvas')
      canvas.className = 'myal-home-grid-canvas'
      document.body.prepend(canvas)

      const context = canvas.getContext('2d')
      if (!context) return

      let width = 0
      let height = 0
      let dpr = Math.max(window.devicePixelRatio || 1, 1)
      let rafId = 0

      const pointer = { x: 0, y: 0 }
      const focus = { x: 0, y: 0 }
      let currentStrength = 0
      let targetStrength = 0
      let strokeColor = 'rgba(127, 103, 190, 0.22)'

      const syncGridColors = () => {
        const styles = getComputedStyle(document.documentElement)
        const divider = styles.getPropertyValue('--vp-c-divider').trim()
        const soft = styles.getPropertyValue('--vp-c-brand-soft').trim()
        strokeColor = soft || divider || 'rgba(127, 103, 190, 0.22)'
      }

      const resize = () => {
        dpr = Math.max(window.devicePixelRatio || 1, 1)
        width = window.innerWidth
        height = window.innerHeight

        canvas.width = Math.max(1, Math.floor(width * dpr))
        canvas.height = Math.max(1, Math.floor(height * dpr))
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        context.setTransform(dpr, 0, 0, dpr, 0, 0)

        if (pointer.x === 0 && pointer.y === 0) {
          pointer.x = width * 0.5
          pointer.y = height * 0.35
          focus.x = pointer.x
          focus.y = pointer.y
        }

        syncGridColors()
      }

      const distendPoint = (x: number, y: number) => {
        const dx = x - focus.x
        const dy = y - focus.y
        const distance = Math.hypot(dx, dy)
        const radius = 240

        if (distance >= radius || distance === 0) {
          return { x, y }
        }

        const t = 1 - distance / radius
        const magnitude = t * t * 26 * currentStrength
        const nx = dx / distance
        const ny = dy / distance

        return {
          x: x + nx * magnitude,
          y: y + ny * magnitude
        }
      }

      const drawWarpedGrid = () => {
        context.clearRect(0, 0, width, height)

        context.lineWidth = 1
        context.strokeStyle = strokeColor
        context.globalAlpha = 0.8

        const spacing = 22

        for (let x = -spacing; x <= width + spacing; x += spacing) {
          context.beginPath()
          for (let y = -spacing; y <= height + spacing; y += 8) {
            const p = distendPoint(x, y)
            if (y === -spacing) context.moveTo(p.x, p.y)
            else context.lineTo(p.x, p.y)
          }
          context.stroke()
        }

        for (let y = -spacing; y <= height + spacing; y += spacing) {
          context.beginPath()
          for (let x = -spacing; x <= width + spacing; x += 8) {
            const p = distendPoint(x, y)
            if (x === -spacing) context.moveTo(p.x, p.y)
            else context.lineTo(p.x, p.y)
          }
          context.stroke()
        }
      }

      const animate = () => {
        focus.x += (pointer.x - focus.x) * 0.16
        focus.y += (pointer.y - focus.y) * 0.16
        currentStrength += (targetStrength - currentStrength) * 0.12

        drawWarpedGrid()
        rafId = window.requestAnimationFrame(animate)
      }

      const onMove = (event: PointerEvent) => {
        pointer.x = event.clientX
        pointer.y = event.clientY
        targetStrength = 1
      }

      const onLeave = () => {
        targetStrength = 0
      }

      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          targetStrength = 0
        }
      }

      resize()
      animate()

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerleave', onLeave)
      window.addEventListener('resize', resize)
      document.addEventListener('visibilitychange', onVisibilityChange)

      cleanupHomeGrid = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('resize', resize)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.cancelAnimationFrame(rafId)
        canvas.remove()
      }
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

      let rafId = 0
      const pendingTargets = new Set<Node>()
      const queueParse = () => {
        if (rafId) return
        rafId = window.requestAnimationFrame(() => {
          rafId = 0
          const targets = Array.from(pendingTargets)
          pendingTargets.clear()
          if (targets.length === 0) return
          targets.forEach((target) => applyTwemoji(target))
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
        if (rafId) window.cancelAnimationFrame(rafId)
        pendingTargets.clear()
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

    const runPostHydrationEffects = () => {
      applyTwemoji()
      setupTwemojiObserver()
      applyTocToggle()
      syncHomePageClass()
      setupHomeGrid()
      updateSyncBadge()
    }

    runAfterHydrationPaint(runPostHydrationEffects)
    router.onAfterRouteChanged = () => {
      runAfterHydrationPaint(runPostHydrationEffects)
    }
  }
} satisfies Theme
