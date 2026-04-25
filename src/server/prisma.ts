import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:39201/db?schema=public",
})

const prisma = new PrismaClient({ adapter })

export { prisma }
