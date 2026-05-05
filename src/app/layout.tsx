import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { getLocale } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import GraphQLLayout from "@/layouts/graphql.layout"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const ogImage = `${appUrl}/images/opengraph.jpg`
const siteTitle = "Mizugi Space CUE03 團拍活動預售"
const siteDescription =
  "Cue 03 競賽泳裝團拍活動 — 2026 年 6 月 13 日（六）& 14 日（日）於台北舉辦，每梯次 20 分鐘 NT$600，立即線上報名。"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "Mizugi Space",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
    locale: "zh_TW",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
      </head>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <GraphQLLayout>{children}</GraphQLLayout>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
