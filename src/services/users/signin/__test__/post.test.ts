import tap from 'tap'
import sinon from 'sinon'
import bcrypt from 'bcryptjs'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { userExample } from '../../../../models/User.js'
import { refreshTokenExample } from '../../../../models/RefreshToken.js'
import { expiresIn } from '../../../../tools/utils/jwtToken.js'

const payload = {
  email: userExample.email,
  password: userExample.password
}

await tap.test('POST /users/signin', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return {
          ...userExample,
          password: await bcrypt.hash(payload.password as string, 12)
        }
      }
    })
    sinon.stub(prisma, 'refreshToken').value({
      create: async () => {
        return refreshTokenExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.type, 'Bearer')
    t.equal(responseJson.expiresIn, expiresIn)
  })

  await t.test('fails with invalid user', async (t) => {
    sinon.stub(prisma, 'user').value({
      findUnique: () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload
    })
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with invalid email', async (t) => {
    sinon.stub(prisma, 'user').value({
      findUnique: () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload: {
        ...payload,
        email: 'incorrect-email'
      }
    })
    t.equal(response.statusCode, 400)
  })

  await t.test("fails if user hasn't got a password", async (t) => {
    sinon.stub(prisma, 'user').value({
      findUnique: () => {
        return {
          ...userExample,
          password: null
        }
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload
    })
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with incorrect password', async (t) => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return userExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload: {
        ...payload,
        password: 'incorrect-password'
      }
    })
    t.equal(response.statusCode, 400)
  })
})
