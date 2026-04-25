import { Prisma } from "@/server/prisma/client"
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils"
import BigNumber from "bignumber.js"
import { defaultFieldResolver, GraphQLSchema } from "graphql"

export const decimalDirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName: string
) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0]
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig
        return {
          ...fieldConfig,
          resolve: async function (source, args, context, info) {
            const result = (await resolve(
              source,
              args,
              context,
              info
            )) as Prisma.Decimal
            return BigNumber(result.toString()).toNumber()
          },
        }
      }
      return fieldConfig
    },
  })
}
