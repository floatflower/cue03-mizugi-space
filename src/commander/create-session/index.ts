import { Command } from "commander"
import { createSessions } from "./create-sessions"

export const createSessionCommand = new Command("create-session")
  .description("建立預設報名場次資料")
  .action(async () => {
    await createSessions()
    process.exit(0)
  })
