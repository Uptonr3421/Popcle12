import type { Metadata } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'

const sora = Sora({ weight: ['400', '600', '700', '800'], subsets: ['latin'], variable: '--font-sora' })
const manrope = Manrope({ weight: ['400', '500', '600', '700', '800'], subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Pop Culture CLE - Comics, Vinyl & Collectibles Loyalty App',
  description: 'Earn stamps on every visit and get free rewards at Pop Culture CLE - Your destination for comics, vinyl, trading cards, and pop culture collectibles in Solon, OH',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ff3b8d',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`font-sans antialiased ${sora.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  )
}
