import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLError, GraphQLSchema } from "graphql"
import { Context } from "../context"
import { ErrorType } from "@/lib/error-type"

export const loginDirectiveTransformer = (schema: GraphQLSchema) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const auth = getDirective(schema, fieldConfig, "login")?.[0]
      if (!auth) return fieldConfig

      const { resolve = defaultFieldResolver } = fieldConfig

      fieldConfig.resolve = async function (parent, args, ctx: Context, info) {
        return resolve(parent, args, ctx, info)
      }
    },
  })
}
