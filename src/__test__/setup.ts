import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import prisma from '../tools/database/prisma.js'

jest.mock('nodemailer', () => {
  return {
    createTransport: () => {
      return {
        sendMail: jest.fn(async () => {})
      }
    }
  }
})

jest.mock('../tools/database/prisma.js', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
