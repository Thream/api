import * as expressValidator from 'express-validator'

import { UserRequest } from '../../models/User'

interface Request {
  [k: string]: any
  body?: any
  cookies?: Record<string, any>
  headers?: Record<string, any>
  params?: Record<string, any>
  query?: Record<string, any>
}

interface CustomRequest extends Request {
  user?: UserRequest
}

declare module 'express-validator' {
  interface Meta {
    req: CustomRequest
    location: expressValidator.Location
    path: string
  }
}
