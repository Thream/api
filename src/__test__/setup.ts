import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { DeepMockProxy } from 'jest-mock-extended/lib/cjs/Mock'

import prisma from '../tools/database/prisma.js'

jest.mock('nodemailer', () => ({
  createTransport: () => {
    return {
      sendMail: jest.fn(async () => {})
    }
  }
}))

jest.mock('../tools/database/prisma.js', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
