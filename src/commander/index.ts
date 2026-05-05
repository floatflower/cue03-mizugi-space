import { config } from "dotenv"
import { Command } from "commander"
import { exportCommand } from "./export"
import { createSessionCommand } from "./create-session"

config({ path: ".env", quiet: true })
config({ path: ".env.local", override: true, quiet: true })

const program = new Command()

program.name("cli").description("mizugi-space CLI").version("0.0.1")

program.addCommand(exportCommand)
program.addCommand(createSessionCommand)

program.parseAsync(process.argv)
