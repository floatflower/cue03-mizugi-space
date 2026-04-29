import { get } from "lodash"
import * as config from "@/lib/config"

export const configHelper = (key: string): unknown => {
  return get(config, key)
}
