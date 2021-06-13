import ejs from 'ejs'
import * as fsWithCallbacks from 'fs'
import path from 'path'

import { Language, Theme } from '../../models/UserSetting'
import { emailLocalesPath, emailTemplatePath } from '../configurations/constants'
import { emailTransporter, EMAIL_INFO } from './emailTransporter'

const fs = fsWithCallbacks.promises

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
  let emailTranslationPath = path.join(emailLocalesPath, language, filename)
  if (!fsWithCallbacks.existsSync(emailTranslationPath)) {
    emailTranslationPath = path.join(emailLocalesPath, 'en', filename)
  }
  const translationString = await fs.readFile(emailTranslationPath, {
    encoding: 'utf-8'
  })
  return JSON.parse(translationString)
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const { email, type, url, theme = 'dark', language = 'en' } = options
  const emailTranslation = await getEmailTranslation(language, type)
  const emailHTML = await ejs.renderFile(emailTemplatePath, {
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
