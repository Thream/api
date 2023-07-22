import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { userExample } from '#src/models/User.js'
import { userSettingsExample } from '#src/models/UserSettings.js'
import { OAuthStrategy } from '#src/tools/utils/OAuthStrategy.js'
import prisma from '#src/tools/database/prisma.js'
import { refreshTokenExample } from '#src/models/RefreshToken.js'

const oauthStrategy = new OAuthStrategy('Discord')

await test('tools/utils/OAuthStrategy', async (t) => {
  await t.test('callbackSignin', async (t) => {
    t.afterEach(() => {
      sinon.restore()
    })

    await t.test('should signup the user', async () => {
      const name = 'Martin'
      const id = '12345'
      sinon.stub(prisma, 'user').value({
        count: async () => {
          return 0
        },
        create: async () => {
          return {
            ...userExample,
            name
          }
        }
      })
      sinon.stub(prisma, 'refreshToken').value({
        create: async () => {
          return refreshTokenExample
        }
      })
      sinon.stub(prisma, 'userSetting').value({
        create: async () => {
          return userSettingsExample
        }
      })
      sinon.stub(prisma, 'oAuth').value({
        findFirst: async () => {
          return null
        },
        create: async () => {
          return {
            id: 1,
            userId: userExample.id,
            provider: 'Discord',
            providerId: id,
            updatedAt: new Date(),
            createdAt: new Date()
          }
        }
      })
      const oAuthCreateSpy = sinon.spy(prisma.oAuth, 'create')
      const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
      const userCountSpy = sinon.spy(prisma.user, 'count')
      const userCreateSpy = sinon.spy(prisma.user, 'create')
      const userSettingCreateSpy = sinon.spy(prisma.userSetting, 'create')
      await oauthStrategy.callbackSignin({ id, name })
      assert.strictEqual(
        oAuthCreateSpy.calledWith({
          data: {
            userId: userExample.id,
            provider: 'Discord',
            providerId: id
          }
        }),
        true
      )
      assert.strictEqual(
        oAuthFindFirstSpy.calledWith({
          where: {
            provider: 'Discord',
            providerId: id
          }
        }),
        true
      )
      assert.strictEqual(userCountSpy.calledWith({ where: { name } }), true)
      assert.strictEqual(userCreateSpy.calledWith({ data: { name } }), true)
      assert.strictEqual(
        userSettingCreateSpy.calledWith({
          data: {
            userId: userExample.id
          }
        }),
        true
      )
    })
  })

  await t.test('callbackAddStrategy', async (t) => {
    t.afterEach(() => {
      sinon.restore()
    })

    await t.test('should add the strategy to the user', async () => {
      const name = userExample.name
      const id = '12345'
      sinon.stub(prisma, 'oAuth').value({
        findFirst: async () => {
          return null
        },
        create: async () => {
          return {
            id: 1,
            userId: userExample.id,
            provider: 'Discord',
            providerId: id,
            updatedAt: new Date(),
            createdAt: new Date()
          }
        }
      })
      const oAuthCreateSpy = sinon.spy(prisma.oAuth, 'create')
      const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
      const result = await oauthStrategy.callbackAddStrategy(
        { id, name },
        { accessToken: '123', current: userExample, currentStrategy: 'Local' }
      )
      assert.strictEqual(result, 'success')
      assert.strictEqual(
        oAuthCreateSpy.calledWith({
          data: {
            userId: userExample.id,
            provider: 'Discord',
            providerId: id
          }
        }),
        true
      )
      assert.strictEqual(
        oAuthFindFirstSpy.calledWith({
          where: {
            provider: 'Discord',
            providerId: id
          }
        }),
        true
      )
    })

    await t.test(
      'should not add the strategy if the account of the provider is already used',
      async () => {
        const name = userExample.name
        const id = '12345'
        sinon.stub(prisma, 'oAuth').value({
          findFirst: async () => {
            return {
              id: 1,
              userId: 2,
              provider: 'Discord',
              providerId: id,
              updatedAt: new Date(),
              createdAt: new Date()
            }
          }
        })
        const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
        const result = await oauthStrategy.callbackAddStrategy(
          { id, name },
          { accessToken: '123', current: userExample, currentStrategy: 'Local' }
        )
        assert.strictEqual(
          result,
          'This account is already used by someone else'
        )
        assert.strictEqual(
          oAuthFindFirstSpy.calledWith({
            where: {
              provider: 'Discord',
              providerId: id
            }
          }),
          true
        )
      }
    )

    await t.test(
      'should not add the strategy if the user is already connected with it',
      async () => {
        const name = userExample.name
        const id = '12345'
        sinon.stub(prisma, 'oAuth').value({
          findFirst: async () => {
            return {
              id: 1,
              userId: userExample.id,
              provider: 'Discord',
              providerId: id,
              updatedAt: new Date(),
              createdAt: new Date()
            }
          }
        })
        const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
        const result = await oauthStrategy.callbackAddStrategy(
          { id, name },
          { accessToken: '123', current: userExample, currentStrategy: 'Local' }
        )
        assert.strictEqual(result, 'You are already using this account')
        assert.strictEqual(
          oAuthFindFirstSpy.calledWith({
            where: {
              provider: 'Discord',
              providerId: id
            }
          }),
          true
        )
      }
    )
  })
})
