import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const upstreamRepo = process.env.UPSTREAM_REPO ?? 'nyas1/Material-You-app-list'
const perPage = Number(process.env.CHANGELOG_MAX ?? '100')
const repoUrl = `https://github.com/${upstreamRepo}`
const apiUrl = `https://api.github.com/repos/${upstreamRepo}/commits?per_page=${perPage}`

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

const rows = commits.map((item) => {
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

const md = `---\ntitle: Changelog\n---\n\n# Changelog\n\nLatest commits with date from [${upstreamRepo}](${repoUrl}).\n\n| Date | Commit | Message |\n| --- | --- | --- |\n${rows.join('\n')}\n`

writeFileSync(resolve(process.cwd(), 'docs/changelog.md'), md)
console.log('Generated docs/changelog.md')
