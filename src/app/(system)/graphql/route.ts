import { NextRequest } from "next/server"
import { Context } from "@/graphql/context"
import { createLoaders } from "@/graphql/dataloader"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { server } from "@/graphql/server"

// @ts-ignore
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (_request: NextRequest): Promise<Context> => {
    return {
      loaders: createLoaders(),
    }
  },
})

// @ts-ignore
export const GET = async (request: NextRequest) => {
  // @ts-ignore
  return await handler(request)
}

// @ts-ignore
export const POST = async (request: NextRequest) => {
  // @ts-ignore
  return await handler(request)
}
