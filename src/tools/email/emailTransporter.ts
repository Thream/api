import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

dotenv.config()
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT ?? '465', 10)

export const EMAIL_INFO: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  ignoreTLS: process.env.NODE_ENV !== 'production'
}

export const emailTransporter = nodemailer.createTransport(EMAIL_INFO)
