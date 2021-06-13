import fsMock from 'mock-fs'
import path from 'path'
import { Sequelize } from 'sequelize-typescript'
import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'

let sqlite: Database | undefined
let sequelize: Sequelize | undefined

jest.mock('nodemailer', () => ({
  createTransport: () => {
    return {
      sendMail: jest.fn(async () => {})
    }
  }
}))

beforeAll(async () => {
  sqlite = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  })
  sequelize = new Sequelize({
    dialect: process.env.DATABASE_DIALECT,
    storage: process.env.DATABASE_DIALECT === 'sqlite' ? ':memory:' : undefined,
    logging: false,
    models: [path.join(__dirname, '..', 'models')]
  })
})

beforeEach(async () => {
  await sequelize?.sync({ force: true })
})

afterEach(async () => {
  fsMock.restore()
})

afterAll(async () => {
  await sqlite?.close()
  await sequelize?.close()
})
