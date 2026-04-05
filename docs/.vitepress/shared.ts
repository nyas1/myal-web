import type { DefaultTheme } from 'vitepress'

export const meta = {
  name: 'MYAL',
  description: 'A curated list of Android apps with Material You / Material Design support.'
}

export const socialLinks: DefaultTheme.SocialLink[] = [
  {
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024q-.159.037-5.061 3.345q-.72.495-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789q.04-.324.893-.663q5.247-2.286 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635"/></svg>'
    },
    link: 'https://t.me/materialyouapps',
    ariaLabel: 'Telegram'
  },
  {
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0a13 13 0 0 0-.617-1.25a.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.08.08 0 0 0 .084-.028a14 14 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13 13 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10 10 0 0 0 .372-.292a.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028a19.8 19.8 0 0 0 6.002-3.03a.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418"/></svg>'
    },
    link: 'https://discord.com/invite/JtUJTTuNW6',
    ariaLabel: 'Discord'
  },
  { icon: 'github', link: 'https://github.com/nyas1/Material-You-app-list' }
]

export const nav: DefaultTheme.NavItem[] = [
  { text: '🏠 Home', link: '/' },
  { text: '📱 Apps', link: '/app' },
  { text: '🆕 Newly Added', link: '/newly-added-apps' },
  {
    text: '🔽 More',
    items: [
      { text: '📑 Changelog', link: '/changelog' },
      { text: '📝 Credits', link: '/credits' },
      { text: '💡 Contribute', link: '/contributing' }
    ]
  }
]

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: 'Navigate',
    collapsed: false,
    items: [
      { text: '🏠 Home', link: '/' },
      { text: '📱 Apps', link: '/app' },
      { text: '🆕 Newly Added Apps', link: '/newly-added-apps' },
      { text: '📑 Changelog', link: '/changelog' },
      { text: '📝 Credits', link: '/credits' },
      { text: '💡 Contribute', link: '/contributing' }
    ]
  }
]
