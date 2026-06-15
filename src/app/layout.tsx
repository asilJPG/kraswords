import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: {
    default: 'Красвордс — современные кроссворды онлайн',
    template: '%s | Красвордс',
  },
  description: 'Современные тематические кроссворды онлайн — по фильмам, играм и поп-культуре. Разгадывайте бесплатно с компьютера или телефона, соревнуйтесь в скорости решения и попадайте в топ игроков!',
  keywords: ['кроссворды', 'кроссворды онлайн', 'современные кроссворды', 'красвордс', 'бесплатные кроссворды', 'тематические кроссворды', 'игры разума', 'умные игры', 'головоломки', 'кроссворды на телефоне'],
  authors: [{ name: 'Красвордс' }],
  metadataBase: new URL('https://xn--80aegvwjdfe.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Красвордс — умные тематические кроссворды онлайн',
    description: 'Разгадывайте бесплатные тематические кроссворды онлайн. Играйте и побеждайте в лиге лидеров!',
    url: 'https://xn--80aegvwjdfe.com',
    siteName: 'Красвордс',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Красвордс — умные тематические кроссворды онлайн',
    description: 'Разгадывайте бесплатные тематические кроссворды онлайн. Играйте и побеждайте в лиге лидеров!',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
  },
}

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}
