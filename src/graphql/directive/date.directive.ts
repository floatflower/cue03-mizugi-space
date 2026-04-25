import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils"
import dayjs from "dayjs"
import { defaultFieldResolver, GraphQLSchema } from "graphql"
import { isNull } from "lodash"

export const dateFormatDirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName: string,
  format: string = "YYYY-MM-DD"
) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0]
      if (directive) {
        const { format } = directive
        const { resolve = defaultFieldResolver } = fieldConfig
        return {
          ...fieldConfig,
          resolve: async function (source, args, context, info) {
            const result = (await resolve(source, args, context, info)) as Date
            if (isNull(result)) return null
            return dayjs(result).format(format)
          },
        }
      }
      return fieldConfig
    },
  })
}
