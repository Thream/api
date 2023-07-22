import fs from 'node:fs'
import { URL, fileURLToPath } from 'node:url'

import ejs from 'ejs'

import type { Language, Theme } from '#src/models/UserSettings.js'
import {
  EMAIL_LOCALES_URL,
  EMAIL_TEMPLATE_URL
} from '#src/tools/configurations.js'
import {
  emailTransporter,
  EMAIL_INFO
} from '#src/tools/email/emailTransporter.js'

interface EmailTranslation {
  subject: string
  renderOptions: {
    subtitle: string
    button: string
    footer: string
  }
}

type EmailType = 'confirm-email' | 'reset-password'

interface SendEmailOptions {
  email: string
  type: EmailType
  url: string
  theme?: Theme
  language?: Language
}

type ThemeColor = {
  [key in Theme]: {
    backgroundPrimary: string
    colorPrimary: string
    colorSecondary: string
  }
}

const themeColors: ThemeColor = {
  dark: {
    backgroundPrimary: '#212121',
    colorPrimary: '#27B05E',
    colorSecondary: '#fff'
  },
  light: {
    backgroundPrimary: '#fff',
    colorPrimary: '#27B05E',
    colorSecondary: '#181818'
  }
}

const getEmailTranslation = async (
  language: Language,
  type: EmailType
): Promise<EmailTranslation> => {
  const filename = `${type}.json`
  let emailTranslationURL = new URL(
    `./${language}/${filename}`,
    EMAIL_LOCALES_URL
  )
  if (!fs.existsSync(emailTranslationURL)) {
    emailTranslationURL = new URL(`./en/${filename}`, EMAIL_LOCALES_URL)
  }
  const translationString = await fs.promises.readFile(emailTranslationURL, {
    encoding: 'utf-8'
  })
  return JSON.parse(translationString)
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const { email, type, url, theme = 'dark', language = 'en' } = options
  const emailTranslation = await getEmailTranslation(language, type)
  const emailHTML = await ejs.renderFile(fileURLToPath(EMAIL_TEMPLATE_URL), {
    text: { ...emailTranslation.renderOptions, url },
    theme: themeColors[theme]
  })
  await emailTransporter.sendMail({
    from: `"Thream" <${EMAIL_INFO?.auth?.user as string}>`,
    to: email,
    subject: `Thream - ${emailTranslation.subject}`,
    html: emailHTML
  })
}
