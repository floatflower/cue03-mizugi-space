import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { Handlebars } from "@/server/handlebars"
import { prisma } from "@/server/prisma"
import supportedLocales from "@/lib/locale.json"

const defaultLocale = supportedLocales[0]

export async function renderEmailTemplate(
  templateName: string,
  recipientEmail: string,
  payload: Record<string, unknown>
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: recipientEmail },
    select: { locale: true },
  })

  const preferredLocale =
    user?.locale && supportedLocales.includes(user.locale)
      ? user.locale
      : defaultLocale

  const preferredPath = join(
    process.cwd(),
    `src/templates/email/${templateName}/${preferredLocale}.hbs`
  )
  const fallbackPath = join(
    process.cwd(),
    `src/templates/email/${templateName}/${defaultLocale}.hbs`
  )

  const templatePath = existsSync(preferredPath) ? preferredPath : fallbackPath
  const source = readFileSync(templatePath, "utf-8")

  return Handlebars.compile(source)(payload)
}
