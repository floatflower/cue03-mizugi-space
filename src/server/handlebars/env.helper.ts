import { get } from "lodash"

export const envHelper = (key: string): string | undefined => {
  return get(process.env, key)
}
