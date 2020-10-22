import ejs from 'ejs'

import { emailTemplatePath } from '../../../utils/config/constants'
import {
  EMAIL_INFO,
  emailTransporter
} from '../../../utils/config/emailTransporter'

interface SendConfirmEmailOptions {
  email: string
  tempToken: string
  redirectURI?: string
  subject: string
  renderOptions: {
    subtitle: string
    buttonText: string
    footerText: string
  }
}

type SendConfirmEmail = (options: SendConfirmEmailOptions) => Promise<void>

export const sendConfirmEmail: SendConfirmEmail = async options => {
  const { tempToken, redirectURI, subject, renderOptions, email } = options
  const redirectQuery = redirectURI != null ? `&redirectURI=${redirectURI}` : ''
  const emailHTML = await ejs.renderFile(emailTemplatePath, {
    subtitle: renderOptions.subtitle,
    buttonText: renderOptions.buttonText,
    url: `${process.env.API_BASE_URL}/users/confirm-email?tempToken=${tempToken}${redirectQuery}`,
    footerText: renderOptions.footerText
  })
  await emailTransporter.sendMail({
    from: `"SocialProject" <${EMAIL_INFO.auth.user}>`,
    to: email,
    subject,
    html: emailHTML
  })
}
