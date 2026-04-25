import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/server/prisma/client.js"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:39201/db?schema=public",
  }),
})

async function main() {
  const { count } = await prisma.session.deleteMany({
    where: { startTime: { in: ["12:00", "12:40"] } },
  })
  console.log(`Deleted ${count} sessions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
