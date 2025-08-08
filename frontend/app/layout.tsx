import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Saugat Timilsina - Full Stack Developer & AI Engineer",
  description:
    "Portfolio of Saugat Timilsina - Full Stack Developer specializing in React, Next.js, Node.js, and AI/ML technologies. Explore my projects and get in touch.",
  keywords: "Saugat Timilsina, Full Stack Developer, React, Next.js, Node.js, AI Engineer, Machine Learning, Portfolio",
  authors: [{ name: "Saugat Timilsina" }],
  creator: "Saugat Timilsina",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://saugattimilsina.dev",
    title: "Saugat Timilsina - Full Stack Developer & AI Engineer",
    description:
      "Portfolio of Saugat Timilsina - Full Stack Developer specializing in React, Next.js, Node.js, and AI/ML technologies.",
    siteName: "Saugat Timilsina Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saugat Timilsina - Full Stack Developer & AI Engineer",
    description:
      "Portfolio of Saugat Timilsina - Full Stack Developer specializing in React, Next.js, Node.js, and AI/ML technologies.",
    creator: "@saugattimilsina",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
