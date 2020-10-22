import { Request, Response, NextFunction } from 'express'
import { Model, BuildOptions } from 'sequelize/types'

export type ErrorsMessageArray = Array<{ message: string, field?: string }>

export interface ObjectAny {
  [key: string]: any
}

export interface RequestHandlerObject {
  req: Request
  res: Response
  next: NextFunction
}

export type SequelizeModelInstance = typeof Model &
  (new (values?: object, options?: BuildOptions) => Model)
