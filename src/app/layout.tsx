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

export const metadata: Metadata = {
  title: "Mizugi Space CUE03 團拍活動預售",
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
