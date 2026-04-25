import { helloQueryResolver } from "./hello.query"
import { sessionsQueryResolver } from "./sessions.query"

export const Query = {
  hello: helloQueryResolver,
  sessions: sessionsQueryResolver,
}
