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
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(join(publicDir, filename))
}

/** Safe zone ~80% diameter (maskable spec); matches web.dev keyline. */
async function writeMaskable(canvas, inner, filename) {
  const buf = await sharp(svg)
    .resize(inner, inner, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer()
  const pad = Math.floor((canvas - inner) / 2)
  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: CHROME
    }
  })
    .composite([{ input: buf, top: pad, left: pad }])
    .png()
    .toFile(join(publicDir, filename))
}

await writePng(1024, 'pwa-1024x1024.png')
await writePng(512, 'pwa-512x512.png')
await writePng(192, 'pwa-192x192.png')
await writePng(180, 'apple-touch-icon.png')
/** 1024 maskable: Chrome often uses maskable (not "any") for splash — 512-only was upscaled → blurry. */
await writeMaskable(1024, 819, 'pwa-maskable-1024x1024.png')
await writeMaskable(512, 410, 'pwa-maskable-512x512.png')

console.log(
  'Wrote pwa-1024x1024.png, pwa-512x512.png, pwa-192x192.png, apple-touch-icon.png, pwa-maskable-1024x1024.png, pwa-maskable-512x512.png'
)
