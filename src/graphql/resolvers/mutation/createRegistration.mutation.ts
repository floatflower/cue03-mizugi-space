import { GraphQLError } from "graphql"
import { ulid } from "ulid"
import { prisma } from "@/server/prisma"
import { ErrorType } from "@/lib/error-type"
import { Context } from "@/graphql/context"
import { newebpay, generateTradeInfo } from "@/server/newebpay/index.js"

const PRICE_PER_SESSION = 600

const calculateAmount = (count: number) => {
  const freeCount = Math.floor(count / 3)
  return (count - freeCount) * PRICE_PER_SESSION
}

export interface ICreateRegistrationMutationArgs {
  data: {
    name: string
    phone: string
    email: string
    sessionIds: string[]
  }
}

export const createRegistrationMutationResolver = async (
  parent: unknown,
  args: ICreateRegistrationMutationArgs,
  context: Context,
  info: unknown
) => {
  const { name, phone, email, sessionIds } = args.data

  if (!sessionIds || sessionIds.length === 0) {
    throw new GraphQLError(ErrorType.SESSION_REQUIRED, {
      extensions: { code: ErrorType.SESSION_REQUIRED },
    })
  }

  const sessions = await prisma.session.findMany({
    where: { id: { in: sessionIds } },
  })

  if (sessions.length !== sessionIds.length) {
    throw new GraphQLError(ErrorType.SESSION_NOT_FOUND, {
      extensions: { code: ErrorType.SESSION_NOT_FOUND },
    })
  }

  const registration = await prisma.$transaction(async (tx) => {
    for (const sessionId of sessionIds) {
      const count = await tx.registrationSession.count({
        where: {
          sessionId,
          registration: {
            status: { in: ["PAID"] },
          },
        },
      })

      const session = sessions.find((s) => s.id === sessionId)!
      if (count >= session.capacity) {
        throw new GraphQLError(ErrorType.SESSION_FULL, {
          extensions: { code: ErrorType.SESSION_FULL, sessionId },
        })
      }
    }

    const id = ulid()
    return tx.registration.create({
      data: {
        id,
        name,
        phone,
        email,
        amount: calculateAmount(sessionIds.length),
        status: "PENDING",
        registrationSessions: {
          create: sessionIds.map((sessionId) => ({
            id: ulid(),
            sessionId,
          })),
        },
      },
    })
  })

  const hashKey = process.env.NEWEBPAY_HASH_KEY!
  const hashIv = process.env.NEWEBPAY_HASH_IV!
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID!

  const NewebPay = newebpay(hashKey, hashIv)

  const tradeInfo = generateTradeInfo({
    merchantId,
    Amt: registration.amount,
    MerchantOrderNo: registration.id,
    NotifyURL: `${process.env.NEWEBPAY_CALLBACK_URL}/callback/newebpay`,
    ReturnURL: `${process.env.NEWEBPAY_CALLBACK_URL}/callback/newebpay/client`,
    ItemDesc: `活動購票`,
    creditCardEnabled: true,
    // applepayEnabled: true,
    androidpayEnabled: true,
    samsungpayEnabled: true,
    payerEmail: email,
  })

  const encryptedData = NewebPay.TradeInfo(tradeInfo).encrypt()

  return {
    registrationId: registration.id,
    payment: {
      merchantId,
      tradeInfo: encryptedData,
      tradeSha: NewebPay.TradeInfo(encryptedData).TradeSha(),
    },
  }
}
