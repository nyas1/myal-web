/**
 * Rasterize docs/public/icon.svg into PWA / Apple touch PNGs.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'docs', 'public')
const svgPath = join(publicDir, 'icon.svg')
const CHROME = '#202126'
const svg = readFileSync(svgPath)

async function writePng(size, filename) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, filename))
}

/** Safe zone ~80% for maskable launcher icons. */
async function writeMaskable512() {
  const inner = 410
  const buf = await sharp(svg).resize(inner, inner).png().toBuffer()
  const pad = Math.floor((512 - inner) / 2)
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: CHROME
    }
  })
    .composite([{ input: buf, top: pad, left: pad }])
    .png()
    .toFile(join(publicDir, 'pwa-maskable-512x512.png'))
}

await writePng(192, 'pwa-192x192.png')
await writePng(512, 'pwa-512x512.png')
await writePng(180, 'apple-touch-icon.png')
await writeMaskable512()

console.log('Wrote pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png, pwa-maskable-512x512.png')
