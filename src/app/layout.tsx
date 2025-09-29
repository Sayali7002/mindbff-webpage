import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/components/ui/NotificationProvider';
import { GlobalNotification } from '@/components/ui/GlobalNotification';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindBFF - Anonymous Peer Support & AI-Powered Mental Health Tools',
  description: 'Transform your mental health journey with MindBFF. Get anonymous peer support, AI-assisted CBT tools, and comprehensive mindfulness resources. 24/7 support, highly secure & private. Free 7-day trial available.',
  keywords: 'mental health, peer support, CBT, mindfulness, meditation, anxiety, depression, therapy, AI therapy, anonymous support, emotional wellness, stress management',
  authors: [{ name: 'Sayali Kshirsagar' }],
  creator: 'Sayali Kshirsagar',
  publisher: 'MindBFF',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mindbff.com',
    title: 'MindBFF - Anonymous Peer Support & AI-Powered Mental Health Tools',
    description: 'Transform your mental health journey with MindBFF. Get anonymous peer support, AI-assisted CBT tools, and comprehensive mindfulness resources.',
    siteName: 'MindBFF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindBFF - Anonymous Peer Support & AI-Powered Mental Health Tools',
    description: 'Transform your mental health journey with MindBFF. Get anonymous peer support, AI-assisted CBT tools, and comprehensive mindfulness resources.',
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "MindBFF",
              "description": "Anonymous peer support and AI-powered mental health tools for emotional wellness",
              "url": "https://www.mindbff.com",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free 7-day trial"
              },
              "author": {
                "@type": "Person",
                "name": "Sayali Kshirsagar",
                "jobTitle": "Founder & CEO",
                "alumniOf": "IIT Bombay",
                "worksFor": {
                  "@type": "Organization",
                  "name": "MindBFF"
                }
              },
              "featureList": [
                "Anonymous Peer Support",
                "AI-Assisted CBT Tools",
                "Mindfulness Resources",
                "24/7 Support",
                "Secure & Private"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          {children}
          <GlobalNotification />
        </NotificationProvider>
      </body>
    </html>
  )
} 