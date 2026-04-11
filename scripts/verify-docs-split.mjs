/**
 * Regression checks for README-derived docs (run after split-readme / docs:sync).
 * Ensures doc H1 + generated block layout is not broken by sync workflows.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { splitFrontmatter, README_AUTO_COMMENT, END_AUTO_GENERATED } from './doc-merge.mjs'
import { README_HEADINGS } from './readme-structure.mjs'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

function readDoc(rel) {
  return readFileSync(resolve(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function extractGeneratedInner(body) {
  const autoIdx = body.indexOf(README_AUTO_COMMENT)
  if (autoIdx === -1) {
    throw new Error(`Missing ${README_AUTO_COMMENT}`)
  }
  const afterAuto = body.slice(autoIdx + README_AUTO_COMMENT.length)
  const nl = afterAuto.indexOf('\n')
  const rest = nl === -1 ? '' : afterAuto.slice(nl + 1)
  const endIdx = rest.indexOf(END_AUTO_GENERATED)
  if (endIdx === -1) {
    throw new Error(`Missing ${END_AUTO_GENERATED}`)
  }
  return rest.slice(0, endIdx).trim()
}

function assertBeforeAutoContains(body, needle, fileLabel) {
  const autoIdx = body.indexOf(README_AUTO_COMMENT)
  const head = autoIdx === -1 ? body : body.slice(0, autoIdx)
  if (!head.includes(needle)) {
    throw new Error(`${fileLabel}: expected manual block before AUTO to include ${JSON.stringify(needle)}`)
  }
}

const expectedDocHeadings = {
  'docs/app.md': '# 📱 Apps',
  'docs/newly-added-apps.md': '# 🆕 Newly Added Apps',
  'docs/credits.md': '# 📝 Credits'
}

for (const [rel, heading] of Object.entries(expectedDocHeadings)) {
  const raw = readDoc(rel)
  const { body } = splitFrontmatter(raw)
  assertBeforeAutoContains(body, heading, rel)
}

const newlyRaw = readDoc('docs/newly-added-apps.md')
const { body: newlyBody } = splitFrontmatter(newlyRaw)
const newlyInner = extractGeneratedInner(newlyBody)

for (const h of README_HEADINGS.newlyAdded) {
  if (newlyInner.startsWith(h.trim())) {
    throw new Error(
      `docs/newly-added-apps.md: generated block must not start with ${JSON.stringify(h)} (duplicate title; see split-readme prepareNewlyAddedSlice).`
    )
  }
}

console.log('verify-docs-split: ok')
