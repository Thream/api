import 'express-async-errors'

import cors from 'cors'
import dotenv from 'dotenv'
import express, { Request } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

import { errorHandler } from './tools/middlewares/errorHandler'
import { router } from './services'
import { NotFoundError } from './tools/errors/NotFoundError'
import { TooManyRequestsError } from './tools/errors/TooManyRequestsError'

const application = express()
dotenv.config()

if (process.env.NODE_ENV === 'development') {
  application.use(morgan<Request>('dev'))
} else if (process.env.NODE_ENV === 'production') {
  const requestPerSecond = 2
  const seconds = 60
  const windowMs = seconds * 1000
  application.enable('trust proxy')
  application.use(
    rateLimit({
      windowMs,
      max: seconds * requestPerSecond,
      handler: () => {
        throw new TooManyRequestsError()
      }
    })
  )
}

application.use(express.json())
application.use(helmet())
application.use(cors<Request>())
application.use(router)
application.use(() => {
  throw new NotFoundError()
})
application.use(errorHandler)

export default application
