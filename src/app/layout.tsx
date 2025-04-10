import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Analytics } from "@/components/analytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "SecondChance Marketplace",
    template: "%s | SecondChance Marketplace",
  },
  description:
    "Buy and sell pre-loved items in your community. Give items a second chance and make sustainable choices.",
  keywords: ["marketplace", "secondhand", "used items", "buy and sell", "sustainable shopping"],
  authors: [{ name: "SecondChance Team" }],
  creator: "SecondChance Marketplace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://secondchance-marketplace.vercel.app/",
    title: "SecondChance Marketplace",
    description: "Buy and sell pre-loved items in your community",
    siteName: "SecondChance Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecondChance Marketplace",
    description: "Buy and sell pre-loved items in your community",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
