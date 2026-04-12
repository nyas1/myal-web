import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { normalizePath } from 'vite'

/** Redirect VitePress `composables/sidebar` imports to our override (alias is unreliable here). */
export function vitepressSidebarOverridePlugin(): Plugin {
  const themeDir = path.dirname(fileURLToPath(import.meta.url))
  const overrideAbs = normalizePath(path.join(themeDir, 'composables/vitepress-sidebar-override.js'))

  return {
    name: 'myal-vitepress-sidebar-override',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null
      const imp = normalizePath(importer)
      if (!imp.includes('vitepress/dist/client/theme-default')) return null

      const s = source.replace(/\\/g, '/')
      if (
        s === './composables/sidebar' ||
        s === '../composables/sidebar' ||
        s.endsWith('/composables/sidebar') ||
        s.endsWith('/composables/sidebar.js')
      ) {
        return overrideAbs
      }
      return null
    }
  }
}
