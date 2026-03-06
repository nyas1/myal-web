/**
 * Upstream README parser contract.
 * Keep these headings aligned with https://github.com/nyas1/Material-You-app-list.
 */
export const README_HEADINGS = {
  newlyAdded: ['## 🆕 Newly Added Apps!'],
  appsStart: ['## 📱 Known Apps', '## 🌐 Social & Communication'],
  sources: ['## 🪢 Sources'],
  toolsUsed: ['## 🔧 Tools Used']
}

export function findFirstHeading(markdown, headings) {
  for (const heading of headings) {
    const index = markdown.indexOf(heading)
    if (index !== -1) return index
  }
  return -1
}

export function includesAnyHeading(markdown, headings) {
  return headings.some((heading) => markdown.includes(heading))
}
