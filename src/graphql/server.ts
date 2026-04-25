import { ApolloServer } from "@apollo/server"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { Context } from "./context"
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"
import { dateFormatDirectiveTransformer } from "./directive/date.directive"
import { decimalDirectiveTransformer } from "./directive/decimal.directive"

let schema = makeExecutableSchema({ typeDefs, resolvers })

schema = dateFormatDirectiveTransformer(
  schema,
  "datetime",
  "YYYY-MM-DD HH:mm:ss"
)
schema = dateFormatDirectiveTransformer(schema, "date", "YYYY-MM-DD")
schema = decimalDirectiveTransformer(schema, "decimal")

export const server = new ApolloServer<Context>({
  schema,
  includeStacktraceInErrorResponses: false,
})
