import { getRequestConfig } from "next-intl/server"
import supportedLocales from "@/lib/locale.json"
import { cookies, headers } from "next/headers"

export default getRequestConfig(async () => {
  let locale = null

  // 1. 從 cookie 取得
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")
  if (cookieLocale && supportedLocales.includes(cookieLocale.value)) {
    locale = cookieLocale.value
  }

  // 2. 從 query string（x-url header）
  if (!locale) {
    const headersList = await headers()
    const xUrl = headersList.get("x-url")
    if (xUrl) {
      const url = new URL(xUrl)
      const queryLocale = url.searchParams.get("locale")
      if (queryLocale && supportedLocales.includes(queryLocale)) {
        locale = queryLocale
      }
    }
  }

  // 3. fallback 到預設 locale
  if (!locale) locale = supportedLocales[0]

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
