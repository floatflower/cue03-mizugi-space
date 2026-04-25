import { prisma } from "@/server/prisma"
import { Context } from "@/graphql/context"

export const sessionsQueryResolver = async (
  parent: unknown,
  args: unknown,
  context: Context,
  info: unknown
) => {
  const sessions = await prisma.session.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  })

  const registrationSessions = await prisma.registrationSession.findMany({
    where: {
      registration: {
        status: { in: ["PAID"] },
      },
    },
    select: { sessionId: true },
  })

  const countMap = new Map<string, number>()
  for (const rs of registrationSessions) {
    countMap.set(rs.sessionId, (countMap.get(rs.sessionId) ?? 0) + 1)
  }

  return sessions.map((session) => {
    const registeredCount = countMap.get(session.id) ?? 0
    return {
      ...session,
      registeredCount,
      available: Math.max(0, session.capacity - registeredCount),
    }
  })
}
