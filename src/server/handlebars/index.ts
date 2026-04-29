// @ts-ignore
import * as Handlebars from "handlebars/dist/cjs/handlebars"
import { currentYearHelper } from "./current-year.helper"
import { envHelper } from "./env.helper"
import { configHelper } from "./config.helper"

Handlebars.registerHelper("currentYear", currentYearHelper)
Handlebars.registerHelper("env", envHelper)
Handlebars.registerHelper("config", configHelper)

export { Handlebars }
