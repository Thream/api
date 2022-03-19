import tap from 'tap'
import sinon from 'sinon'
import httpErrors from 'http-errors'
import jwt from 'jsonwebtoken'

import { getUserWithBearerToken } from '../authenticateUser.js'
import prisma from '../../database/prisma.js'
import { userExample } from '../../../models/User.js'

const { Unauthorized, Forbidden, BadRequest } = httpErrors

await tap.test(
  'tools/plugins/authenticateUser - getUserWithBearerToken',
  async (t) => {
    t.afterEach(() => {
      sinon.restore()
    })

    await t.test('shoulds succeeds with the right information', async (t) => {
      sinon.stub(prisma, 'user').value({
        findUnique: async () => {
          return userExample
        }
      })
      const currentStrategy = 'local'
      sinon.stub(jwt, 'verify').value(() => {
        return { id: userExample.id, currentStrategy }
      })
      const userWithBearerToken = await getUserWithBearerToken('Bearer token')
      t.equal(userWithBearerToken.current.id, userExample.id)
      t.equal(userWithBearerToken.current.name, userExample.name)
      t.equal(userWithBearerToken.accessToken, 'token')
      t.equal(userWithBearerToken.currentStrategy, currentStrategy)
    })

    await t.test(
      'shoulds throws `Unauthorized` if `bearerToken` is not a string',
      async (t) => {
        await t.rejects(getUserWithBearerToken(undefined), Unauthorized)
      }
    )

    await t.test(
      'shoulds throws `Unauthorized` if `bearerToken` is not to the right format: `"Bearer token"`',
      async (t) => {
        await t.rejects(getUserWithBearerToken('Bearer'), Unauthorized)
        await t.rejects(getUserWithBearerToken(''), Unauthorized)
        await t.rejects(
          getUserWithBearerToken('Bearer token token2'),
          Unauthorized
        )
      }
    )

    await t.test(
      'shoulds throws `Forbidden` if invalid `bearerToken` by `jwt.verify`',
      async (t) => {
        sinon.stub(jwt, 'verify').value(() => {
          throw new Error('Invalid token')
        })
        await t.rejects(getUserWithBearerToken('Bearer token'), Forbidden)
      }
    )

    await t.test(
      "shoulds throws `Forbidden` if the user doesn't exist",
      async (t) => {
        sinon.stub(prisma, 'user').value({
          findUnique: async () => {
            return null
          }
        })
        sinon.stub(jwt, 'verify').value(() => {
          return { id: userExample.id }
        })
        await t.rejects(getUserWithBearerToken('Bearer token'), Forbidden)
      }
    )

    await t.test(
      'shoulds throws `BadRequest` if the user account is not confirmed',
      async (t) => {
        sinon.stub(prisma, 'user').value({
          findUnique: async () => {
            return {
              ...userExample,
              isConfirmed: false
            }
          }
        })
        sinon.stub(jwt, 'verify').value(() => {
          return { id: userExample.id, currentStrategy: 'local' }
        })
        await t.rejects(getUserWithBearerToken('Bearer token'), BadRequest)
      }
    )
  }
)
