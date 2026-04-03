import { resolve } from 'node:path'
import { mergeChangelogDoc } from './doc-merge.mjs'

const upstreamRepo = process.env.UPSTREAM_REPO ?? 'nyas1/Material-You-app-list'
/** GitHub caps `per_page` at 100 for this endpoint; never request or show more. */
const MAX_COMMITS = 100
const fromEnv = Number(process.env.CHANGELOG_MAX)
const commitLimit =
  Number.isFinite(fromEnv) && fromEnv > 0 ? Math.min(Math.floor(fromEnv), MAX_COMMITS) : MAX_COMMITS
const repoUrl = `https://github.com/${upstreamRepo}`
const apiUrl = `https://api.github.com/repos/${upstreamRepo}/commits?per_page=${commitLimit}`

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'material-you-app-list-sync-bot'
}

if (process.env.GITHUB_TOKEN) {
  // @ts-expect-error optional auth header
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
}

const response = await fetch(apiUrl, { headers })
if (!response.ok) {
  throw new Error(`Failed to fetch commits: ${response.status} ${response.statusText}`)
}

const commits = await response.json()
if (!Array.isArray(commits)) {
  throw new Error('Unexpected commits API response')
}

const rows = commits.slice(0, commitLimit).map((item) => {
  const hash = item.sha
  const short = String(hash).slice(0, 7)
  const dateIso = item?.commit?.author?.date ?? ''
  const date = String(dateIso).slice(0, 10)
  const subject = String(item?.commit?.message ?? '')
    .split('\n')[0]
    .replace(/\|/g, '\\|')
  const commitLink = `[${short}](${repoUrl}/commit/${hash})`
  return `| ${date} | ${commitLink} | ${subject} |`
})

const table = `| Date | Commit | Message |\n| --- | --- | --- |\n${rows.join('\n')}\n`

mergeChangelogDoc(resolve(process.cwd(), 'docs/changelog.md'), table, {
  defaultFrontmatter: 'title: Changelog',
  upstreamRepo,
  repoUrl
})
console.log('Generated docs/changelog.md')
