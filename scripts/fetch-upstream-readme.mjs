import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { includesAnyHeading, README_HEADINGS } from './readme-structure.mjs'

const upstreamReadmeUrl =
  process.env.UPSTREAM_README_URL ??
  'https://raw.githubusercontent.com/nyas1/Material-You-app-list/main/README.md'

const upstreamReadmePath =
  process.env.UPSTREAM_README_PATH ??
  'data/upstream-README.md'

const response = await fetch(upstreamReadmeUrl, {
  headers: {
    'User-Agent': 'material-you-app-list-sync-bot'
  }
})

if (!response.ok) {
  throw new Error(`Failed to fetch upstream README: ${response.status} ${response.statusText}`)
}

const readme = await response.text()
if (
  !includesAnyHeading(readme, README_HEADINGS.newlyAdded) ||
  !includesAnyHeading(readme, README_HEADINGS.sources) ||
  !includesAnyHeading(readme, README_HEADINGS.appsStart)
) {
  throw new Error('Fetched README does not match expected upstream structure')
}

const absoluteTargetPath = resolve(process.cwd(), upstreamReadmePath)
mkdirSync(resolve(absoluteTargetPath, '..'), { recursive: true })
writeFileSync(absoluteTargetPath, readme.replace(/\r\n/g, '\n'))
console.log(`Fetched and updated ${upstreamReadmePath} from upstream`)
