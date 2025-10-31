import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '1031 Exchange Platform - Instant Property Swaps',
  description: 'AI-powered 1031 exchange matching platform. Find your perfect property swap in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
