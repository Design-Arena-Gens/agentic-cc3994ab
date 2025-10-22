import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Ad Designer – Free, High-Quality Ads',
  description: 'Generate ad copy with AI and design crisp, high-resolution ads in your browser. Free export to PNG.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  )
}
