import nodemailer from "nodemailer"
import type { SendMailOptions } from "nodemailer"

let _transport: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransport() {
  if (_transport) return _transport

  if (process.env.MAIL_TRANSPORT === "mailgun") {
    _transport = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASS,
      },
    })
  } else {
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 25),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER
        ? {
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          }
        : {}),
    })
  }

  return _transport
}

export const mailer = {
  sendMail: (options: SendMailOptions) => getTransport().sendMail(options),
}
