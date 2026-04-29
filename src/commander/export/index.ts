import { Command } from "commander"
import { exportRegistrations } from "./export-registrations"

export const exportCommand = new Command("export")
  .description("匯出已完成報名名單並寄送 CSV")
  .requiredOption("--email <email>", "收件信箱")
  .action(async (options: { email: string }) => {
    await exportRegistrations(options.email)
    process.exit(0)
  })
