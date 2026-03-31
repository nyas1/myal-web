import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { findFirstHeading, README_HEADINGS } from './readme-structure.mjs'

const SYNC_COMMIT_SUBJECT = 'chore(sync): update from nyas1/Material-You-app-list'

const root = resolve(process.cwd())
const readmePath =
  process.env.UPSTREAM_README_PATH
    ? resolve(root, process.env.UPSTREAM_README_PATH)
    : resolve(root, 'data/upstream-README.md')
const fallbackReadmePath = resolve(root, 'README.md')
const docsDir = resolve(root, 'docs')

const sourceReadmePath = existsSync(readmePath) ? readmePath : fallbackReadmePath
const readme = readFileSync(sourceReadmePath, 'utf8').replace(/\r\n/g, '\n')
const lastSyncDate = getLastSyncDate(sourceReadmePath)
const lastSyncEpoch = Math.floor(lastSyncDate.getTime() / 1000)

const newlyStart = findFirstHeading(readme, README_HEADINGS.newlyAdded)
const appsStart = findFirstHeading(readme, README_HEADINGS.appsStart)
const sourcesStart = findFirstHeading(readme, README_HEADINGS.sources)
const toolsUsedStart = findFirstHeading(readme, README_HEADINGS.toolsUsed)

if ([newlyStart, appsStart, sourcesStart].some((i) => i === -1)) {
  throw new Error('README structure changed. Missing expected section headings.')
}

if (!(newlyStart < appsStart && appsStart < sourcesStart)) {
  throw new Error('README structure changed. Section heading order is unexpected.')
}

function stripTocBacklinks(markdown) {
  return markdown
    .replace(/\n?<sub>\s*\[📜\s*Table\s*Of\s*Contents\]\(#-table-of-contents\)\s*<\/sub>\s*\n?/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeAppsStructure(markdown) {
  return markdown
    .replace(/^###\s*🔧\s*Uncategorized\s*Tools\s*$/im, '## 🔧 Uncategorized Tools')
    .trim()
}

const APP_LINE_PATTERN =
  /^\s*[-*+]\s+(?:\*\*)?`[^`]+`(?:\*\*)?\s+\[([^\]]+?)\]\(\s*([^) \t]+)\s*(?:\s+(['"])(.*?)\3)?\s*\)\s*(?:<sup>.*)?\s*$/gmu

const newlyAdded = stripTocBacklinks(readme.slice(newlyStart, appsStart).trim())
const apps = normalizeAppsStructure(stripTocBacklinks(readme.slice(appsStart, sourcesStart).trim()))
const sourcesEnd = toolsUsedStart !== -1 && toolsUsedStart > sourcesStart ? toolsUsedStart : readme.length
const sources = stripTocBacklinks(readme.slice(sourcesStart, sourcesEnd).trim())

function getUniqueAppCount(markdown) {
  const uniqueApps = new Set()

  for (const match of markdown.matchAll(APP_LINE_PATTERN)) {
    const name = normalizeAppName(match[1])
    const urlKey = normalizeUrlKey(match[2])
    const key = urlKey ? `url:${urlKey}` : name ? `name:${name}` : ''

    if (key) {
      uniqueApps.add(key)
    }
  }

  return uniqueApps.size
}

function normalizeAppName(rawName) {
  return rawName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '')
}

function normalizeUrlKey(rawUrl) {
  const input = rawUrl.trim()
  if (!input) {
    return ''
  }

  const cleaned = input.replace(/[)>.,;:!?]+$/, '')

  try {
    const url = new URL(cleaned)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const host = url.hostname.toLowerCase().replace(/^www\./, '')
      const path = url.pathname.replace(/\/+$/, '')
      const search = url.search
      return `${host}${path}${search}`
    }

    return cleaned.toLowerCase().replace(/\/+$/, '')
  } catch {
    return cleaned
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
  }
}

const appCount = getUniqueAppCount(apps)

function getLastSyncDate(filePath) {
  try {
    const output = execFileSync('git', ['log', '-n', '200', '--format=%ct%x09%s'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
    const lines = output.split(/\r?\n/).filter(Boolean)
    const syncLine = lines.find((line) => line.includes(`\t${SYNC_COMMIT_SUBJECT}`))

    if (syncLine) {
      const tabIndex = syncLine.indexOf('\t')
      const timestamp = tabIndex === -1 ? '' : syncLine.slice(0, tabIndex)
      if (timestamp && /^\d+$/.test(timestamp)) {
        return new Date(Number(timestamp) * 1000)
      }
    }
  } catch {
    // Fall back to file mtime when git context is unavailable.
  }

  return statSync(filePath).mtime
}

const indexDoc = `---\ntitle: Material You App List\nlayout: home\nsyncLastEpoch: ${lastSyncEpoch}\nhero:\n  name: Material You Apps List\n  tagline: Curated apps that follow Material Design 3 ✨\n  image:\n    src: /home-hero.svg\n    alt: Material You\n  actions:\n    - theme: brand\n      text: Browse Apps\n      link: /app\n    - theme: alt\n      text: ${appCount} Apps\n      link: /app\n    - theme: alt\n      text: Synced\n      link: /changelog\nfeatures:\n  - icon: '<span class="myal-home-icon myal-home-icon-folder-search" aria-hidden="true"></span>'\n    title: App Directory\n    details: Browse all categories from social and productivity to tools and privacy.\n  - icon: '<span class="myal-home-icon myal-home-icon-sparkles-alt" aria-hidden="true"></span>'\n    title: Newly Added Apps\n    details: Quickly see the latest apps added to the list.\n  - icon: '<span class="myal-home-icon myal-home-icon-note-book" aria-hidden="true"></span>'\n    title: Commit Changelog\n    details: Track repository updates with commit dates and messages.\n---\n`

const appDoc = `---\ntitle: Apps\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${apps}\n`

const newlyDoc = `---\ntitle: Newly Added Apps\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${newlyAdded}\n`

const creditsDoc = `---\ntitle: Credits\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${sources}\n`

mkdirSync(docsDir, { recursive: true })
writeFileSync(resolve(docsDir, 'index.md'), indexDoc)
writeFileSync(resolve(docsDir, 'app.md'), appDoc)
writeFileSync(resolve(docsDir, 'newly-added-apps.md'), newlyDoc)
writeFileSync(resolve(docsDir, 'credits.md'), creditsDoc)

console.log('Generated docs/index.md, docs/app.md, docs/newly-added-apps.md, docs/credits.md')
