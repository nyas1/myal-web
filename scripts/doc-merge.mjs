import { existsSync, readFileSync, writeFileSync } from 'node:fs'

export function splitFrontmatter(raw) {
  const text = String(raw).replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) return { frontmatter: null, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end === -1) return { frontmatter: null, body: text }
  return {
    frontmatter: text.slice(4, end),
    body: text.slice(end + 5)
  }
}

export const README_AUTO_COMMENT =
  '<!-- AUTO-GENERATED from README.md by scripts/split-readme.mjs -->'

export const END_AUTO_GENERATED = '<!-- END AUTO-GENERATED -->'

export const CHANGELOG_TABLE_AUTO_COMMENT =
  '<!-- AUTO-GENERATED: upstream commit table (scripts/generate-changelog.mjs) -->'

/**
 * Keep frontmatter and optional markdown before the AUTO marker.
 * Replace only the generated inner content between AUTO and END markers.
 * Markdown after the block is preserved only when `END_AUTO_GENERATED` is present;
 * if AUTO exists but END is missing, content after AUTO may be replaced on the next write.
 */
export function writeMergedReadmeDerivedDoc(filePath, defaultFrontmatter, generatedInner) {
  const inner = generatedInner.trimEnd()
  const AUTO = README_AUTO_COMMENT
  const END = END_AUTO_GENERATED
  const defaultFm = defaultFrontmatter.trimEnd()

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `---\n${defaultFm}\n---\n\n${AUTO}\n\n${inner}\n\n${END}\n`)
    return
  }

  const raw = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
  const { frontmatter, body } = splitFrontmatter(raw)
  const fm = (frontmatter ?? defaultFm).trimEnd()

  const autoIdx = body.indexOf(AUTO)
  if (autoIdx === -1) {
    writeFileSync(filePath, `---\n${fm}\n---\n\n${AUTO}\n\n${inner}\n\n${END}\n`)
    return
  }

  const afterAutoStart = autoIdx + AUTO.length
  const nlAfterAuto = body.indexOf('\n', afterAutoStart)
  const afterFirstLine = nlAfterAuto === -1 ? body.slice(afterAutoStart) : body.slice(nlAfterAuto + 1)

  const endIdx = afterFirstLine.indexOf(END)
  const suffix = endIdx === -1 ? '' : afterFirstLine.slice(endIdx + END.length).replace(/^\s*\n?/, '')
  const beforeAuto = body.slice(0, autoIdx).replace(/\s+$/, '')

  const prefixBlock = beforeAuto ? `${beforeAuto}\n\n` : ''
  const suffixBlock = suffix ? `\n\n${suffix}` : ''
  writeFileSync(
    filePath,
    `---\n${fm}\n---\n\n${prefixBlock}${AUTO}\n\n${inner}\n\n${END}${suffixBlock}\n`
  )
}

/**
 * Only updates sync epoch + "/app" hero action count. Creates full default file if missing.
 */
export function patchOrCreateHomeIndex(filePath, { syncLastEpoch, appCount, indexDocFullDefault }) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, indexDocFullDefault)
    return
  }

  let s = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')

  if (/^syncLastEpoch:\s*\d+/m.test(s)) {
    s = s.replace(/^syncLastEpoch:\s*\d+/m, `syncLastEpoch: ${syncLastEpoch}`)
  } else if (/^layout:\s*home\s*$/m.test(s)) {
    s = s.replace(/^(layout:\s*home\s*\n)/m, `$1syncLastEpoch: ${syncLastEpoch}\n`)
  } else if (/^title:\s*.+$/m.test(s)) {
    s = s.replace(/^(title:\s*[^\n]+\n)/m, `$1syncLastEpoch: ${syncLastEpoch}\n`)
  } else {
    s = s.replace(/^(---\n)/, `$1syncLastEpoch: ${syncLastEpoch}\n`)
  }

  s = s.replace(/(^      text: )[^\n]+(\n      link: \/app)/m, `$1${appCount} Apps$2`)

  writeFileSync(filePath, s)
}

export function mergeChangelogDoc(filePath, tableBlock, { defaultFrontmatter, upstreamRepo, repoUrl }) {
  const AUTO = CHANGELOG_TABLE_AUTO_COMMENT
  const END = END_AUTO_GENERATED
  const defaultFm = defaultFrontmatter.trimEnd()
  const table = tableBlock.trimEnd()

  const defaultPreamble = `# 🪵 Changelog\n\nLatest commits with date from [${upstreamRepo}](${repoUrl}).\n\n`

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `---\n${defaultFm}\n---\n\n${defaultPreamble}${AUTO}\n\n${table}\n\n${END}\n`)
    return
  }

  const raw = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
  const { frontmatter, body } = splitFrontmatter(raw)
  const fm = (frontmatter ?? defaultFm).trimEnd()

  const autoIdx = body.indexOf(AUTO)
  if (autoIdx !== -1) {
    const head = body.slice(0, autoIdx).trimStart().replace(/\s+$/, '')
    const afterAuto = body.slice(autoIdx + AUTO.length)
    const nl = afterAuto.indexOf('\n')
    const rest = nl === -1 ? '' : afterAuto.slice(nl + 1)
    const endIdx = rest.indexOf(END)
    const suffix = endIdx === -1 ? '' : rest.slice(endIdx + END.length).replace(/^\s*\n?/, '')
    const headBlock = head ? `${head}\n\n` : ''
    const suffixBlock = suffix ? `\n\n${suffix}` : ''
    writeFileSync(
      filePath,
      `---\n${fm}\n---\n\n${headBlock}${AUTO}\n\n${table}\n\n${END}${suffixBlock}\n`
    )
    return
  }

  const tableHeaderMatch = body.match(/^\| Date \| Commit \| Message \|$/m)
  let preamble = defaultPreamble.trimEnd()
  if (tableHeaderMatch && tableHeaderMatch.index !== undefined) {
    preamble = body.slice(0, tableHeaderMatch.index).trimStart().trimEnd()
  }
  preamble = preamble.trimStart().trimEnd()

  const headBlock = preamble ? `${preamble}\n\n` : ''
  writeFileSync(filePath, `---\n${fm}\n---\n\n${headBlock}${AUTO}\n\n${table}\n\n${END}\n`)
}
