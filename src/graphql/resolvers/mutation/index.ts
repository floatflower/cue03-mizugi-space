import { helloMutationResolver } from "./hello.mutation"
import { createRegistrationMutationResolver } from "./createRegistration.mutation"

export const Mutation = {
  hello: helloMutationResolver,
  createRegistration: createRegistrationMutationResolver,
}
