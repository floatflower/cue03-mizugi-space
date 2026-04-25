import GraphQLJSON from "graphql-type-json"
import { Query } from "./query/root"
import { Mutation } from "./mutation"

export const resolvers = {
  JSON: GraphQLJSON,
  Query,
  Mutation,
}
