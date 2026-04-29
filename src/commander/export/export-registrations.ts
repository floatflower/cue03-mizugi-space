import Papa from "papaparse"
import { prisma } from "@/server/prisma"
import { mailer } from "@/server/mailer"

export async function exportRegistrations(email: string) {
  const registrations = await prisma.registration.findMany({
    where: { status: "PAID" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      amount: true,
      createdAt: true,
      registrationSessions: {
        select: {
          session: {
            select: {
              date: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  })

  if (registrations.length === 0) {
    console.log("查無已完成報名的報名人")
    return
  }

  const csv = Papa.unparse(
    registrations.flatMap((r) =>
      r.registrationSessions.map((rs) => ({
        訂單編號: r.id,
        姓名: r.name,
        電話: "\t" + r.phone,
        Email: r.email,
        報名時段: `${rs.session.date} ${rs.session.startTime}-${rs.session.endTime}`,
        報名時間: r.createdAt.toISOString(),
      }))
    )
  )

  const today = new Date().toISOString().split("T")[0]

  await mailer.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `報名名單匯出 ${today}`,
    text: `共 ${registrations.length} 筆已完成報名，請見附件。`,
    attachments: [
      {
        filename: `registrations-${today}.csv`,
        // BOM 讓 Excel 正確辨識 UTF-8
        content: "﻿" + csv,
        contentType: "text/csv; charset=utf-8",
      },
    ],
  })

  console.log(`✓ 已匯出 ${registrations.length} 筆報名，寄至 ${email}`)
}
