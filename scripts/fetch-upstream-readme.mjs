import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const upstreamReadmeUrl =
  process.env.UPSTREAM_README_URL ??
  'https://raw.githubusercontent.com/nyas1/Material-You-app-list/main/README.md'

const response = await fetch(upstreamReadmeUrl, {
  headers: {
    'User-Agent': 'material-you-app-list-sync-bot'
  }
})

if (!response.ok) {
  throw new Error(`Failed to fetch upstream README: ${response.status} ${response.statusText}`)
}

const readme = await response.text()
if (!readme.includes('## 🆕 Newly Added Apps!')) {
  throw new Error('Fetched README does not match expected upstream structure')
}

writeFileSync(resolve(process.cwd(), 'README.md'), readme.replace(/\r\n/g, '\n'))
console.log('Fetched and updated README.md from upstream')
