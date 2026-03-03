import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const readmePath = resolve(root, 'README.md')
const docsDir = resolve(root, 'docs')

const readme = readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n')

const tocStart = readme.indexOf('## 📜 Table Of Contents')
const disclaimerStart = readme.indexOf('### 📋 Disclaimer')
const newlyStart = readme.indexOf('## 🆕 Newly Added Apps!')
const appsStart = readme.indexOf('## 🌐 Social & Communication')
const sourcesStart = readme.indexOf('## 🪢 Sources')
const toolsUsedStart = readme.indexOf('## 🔧 Tools Used')

if ([tocStart, disclaimerStart, newlyStart, appsStart, sourcesStart].some((i) => i === -1)) {
  throw new Error('README structure changed. Could not locate expected section headings.')
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

const newlyAdded = stripTocBacklinks(readme.slice(newlyStart, appsStart).trim())
const apps = normalizeAppsStructure(stripTocBacklinks(readme.slice(appsStart, sourcesStart).trim()))
const sourcesEnd = toolsUsedStart !== -1 && toolsUsedStart > sourcesStart ? toolsUsedStart : readme.length
const sources = stripTocBacklinks(readme.slice(sourcesStart, sourcesEnd).trim())

function getUniqueAppCount(markdown) {
  const appLinePattern = /^\s*-\s+`[^`]+`\s+\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gm
  const uniqueApps = new Set()
  let match = appLinePattern.exec(markdown)

  while (match) {
    const name = match[1].trim().toLowerCase()
    const url = match[2].trim().toLowerCase().replace(/\/+$/, '')
    const key = url || name
    uniqueApps.add(key)
    match = appLinePattern.exec(markdown)
  }

  return uniqueApps.size
}

const appCount = getUniqueAppCount(apps)

const indexDoc = `---\ntitle: Material You App List\nlayout: home\nhero:\n  name: Material You Apps List\n  tagline: Curated apps that follow Material Design 3 / Material You\n  image:\n    src: /home-hero.svg\n    alt: Material You\n  actions:\n    - theme: brand\n      text: Browse Apps\n      link: /app\n    - theme: alt\n      text: ${appCount} Apps\n      link: /app\nfeatures:\n  - icon: '<span class="myal-home-icon myal-home-icon-folder-search" aria-hidden="true"></span>'\n    title: App Directory\n    details: Browse all categories from social and productivity to tools and privacy.\n  - icon: '<span class="myal-home-icon myal-home-icon-sparkles-alt" aria-hidden="true"></span>'\n    title: Newly Added Apps\n    details: Quickly see the latest apps added to the list.\n  - icon: '<span class="myal-home-icon myal-home-icon-note-book" aria-hidden="true"></span>'\n    title: Commit Changelog\n    details: Track repository updates with commit dates and messages.\n---\n`

const appDoc = `---\ntitle: Apps\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${apps}\n`

const newlyDoc = `---\ntitle: Newly Added Apps\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${newlyAdded}\n`

const creditsDoc = `---\ntitle: Credits\n---\n\n<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->\n\n${sources}\n`

mkdirSync(docsDir, { recursive: true })
writeFileSync(resolve(docsDir, 'index.md'), indexDoc)
writeFileSync(resolve(docsDir, 'app.md'), appDoc)
writeFileSync(resolve(docsDir, 'newly-added-apps.md'), newlyDoc)
writeFileSync(resolve(docsDir, 'credits.md'), creditsDoc)

console.log('Generated docs/index.md, docs/app.md, docs/newly-added-apps.md, docs/credits.md')
