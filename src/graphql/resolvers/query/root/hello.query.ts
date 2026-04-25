import { Context } from "@/graphql/context"

export const helloQueryResolver = async (
  parent: any,
  args: any,
  context: Context,
  info: any
) => {
  return "hello world"
}
