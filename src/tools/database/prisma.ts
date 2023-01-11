import Prisma from '@prisma/client'

const { PrismaClient } = Prisma

const prisma = new PrismaClient({
  log:
    process.env['NODE_ENV'] === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error']
})

export default prisma
