export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      HOST: string
      PORT: string
      DATABASE_URL: string
      JWT_ACCESS_EXPIRES_IN: string
      JWT_ACCESS_SECRET: string
      JWT_REFRESH_SECRET: string
      DISCORD_CLIENT_ID: string
      DISCORD_CLIENT_SECRET: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      EMAIL_HOST: string
      EMAIL_USER: string
      EMAIL_PASSWORD: string
      EMAIL_PORT: string
    }
  }
}
