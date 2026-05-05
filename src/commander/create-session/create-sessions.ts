import { ulid } from "ulid"
import { prisma } from "@/server/prisma"

const DATES = ["2026-06-13", "2026-06-14"]

const TIME_SLOTS = [
  { startTime: "11:00", endTime: "11:20" },
  { startTime: "11:40", endTime: "12:00" },
  { startTime: "13:00", endTime: "13:20" },
  { startTime: "13:40", endTime: "14:00" },
  { startTime: "14:00", endTime: "14:20" },
  { startTime: "14:40", endTime: "15:00" },
  { startTime: "15:00", endTime: "15:20" },
  { startTime: "15:40", endTime: "16:00" },
]

export async function createSessions() {
  const existing = await prisma.session.count()
  if (existing > 0) {
    console.log(`Sessions already seeded (${existing} records). Skipping.`)
    return
  }

  const sessions = DATES.flatMap((date) =>
    TIME_SLOTS.map((slot) => ({
      id: ulid(),
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: 6,
    }))
  )

  await prisma.session.createMany({ data: sessions })
  console.log(`✅ Seeded ${sessions.length} sessions.`)
}
