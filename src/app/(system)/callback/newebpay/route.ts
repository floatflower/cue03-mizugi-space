import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { newebpay } from "@/server/newebpay/index.js"
import { mailer } from "@/server/mailer"
import { renderEmailTemplate } from "@/server/email/render"

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const body = new URLSearchParams(await request.text())

  const tradeInfoRaw = body.get("TradeInfo")
  const tradeShaReceived = body.get("TradeSha")

  if (!tradeInfoRaw || !tradeShaReceived) {
    return new NextResponse("400|BAD_REQUEST")
  }

  const hashKey = process.env.NEWEBPAY_HASH_KEY!
  const hashIv = process.env.NEWEBPAY_HASH_IV!

  const expectedTradeSha = createHash("sha256")
    .update(`HashKey=${hashKey}&${tradeInfoRaw}&HashIV=${hashIv}`)
    .digest("hex")
    .toUpperCase()

  if (expectedTradeSha !== tradeShaReceived) {
    return new NextResponse("400|INVALID_SIGNATURE")
  }

  let result: Record<string, unknown>
  try {
    const NewebPay = newebpay(hashKey, hashIv)
    const decrypted = NewebPay.TradeInfo(
      tradeInfoRaw
    ).decrypt() as unknown as string
    result = JSON.parse(decrypted)
  } catch {
    return new NextResponse("400|DECRYPT_FAILED")
  }

  const status = result?.Status as string | undefined
  const resultData = result?.Result as Record<string, unknown> | undefined
  const amt = resultData?.Amt
  const merchantOrderNo = resultData?.MerchantOrderNo as string | undefined

  if (!merchantOrderNo) return new NextResponse("200|OK")

  const registration = await prisma.registration.findUnique({
    where: { id: merchantOrderNo },
  })

  if (!registration) return new NextResponse("200|OK")

  if (
    status === "SUCCESS" &&
    registration.status === "PENDING" &&
    Number(amt) === registration.amount
  ) {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: "PAID" },
    })

    const html = await renderEmailTemplate(
      "payment-success",
      registration.email,
      {
        name: registration.name,
        orderId: registration.id,
        amount: registration.amount,
      }
    )

    await mailer.sendMail({
      from: process.env.MAIL_FROM,
      to: registration.email,
      subject: "付款成功通知",
      html,
    })
  }

  return new NextResponse("200|OK")
}
