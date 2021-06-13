import path from 'path'

export const PORT = parseInt(process.env.PORT ?? '8080', 10)
export const HOST = process.env.HOST ?? '0.0.0.0'

export const SRC_PATH = path.join(__dirname, '..', '..')
export const ROOT_PATH = path.join(SRC_PATH, '..')
export const EMAIL_PATH = path.join(ROOT_PATH, 'email')
export const EMAIL_TEMPLATE_PATH = path.join(EMAIL_PATH, 'email-template.ejs')
export const EMAIL_LOCALES_PATH = path.join(EMAIL_PATH, 'locales')
