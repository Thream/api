import tap from 'tap'
import sinon from 'sinon'

import { userExample } from '../../../models/User.js'
import { userSettingsExample } from '../../../models/UserSettings.js'
import { OAuthStrategy } from '../OAuthStrategy.js'
import prisma from '../../database/prisma.js'
import { refreshTokenExample } from '../../../models/RefreshToken.js'

const oauthStrategy = new OAuthStrategy('discord')

await tap.test('tools/utils/OAuthStrategy', async (t) => {
  await t.test('callbackSignin', async (t) => {
    t.afterEach(() => {
      sinon.restore()
    })

    await t.test('should signup the user', async (t) => {
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
            provider: 'discord',
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
      t.equal(
        oAuthCreateSpy.calledWith({
          data: {
            userId: userExample.id,
            provider: 'discord',
            providerId: id
          }
        }),
        true
      )
      t.equal(
        oAuthFindFirstSpy.calledWith({
          where: {
            provider: 'discord',
            providerId: id
          }
        }),
        true
      )
      t.equal(userCountSpy.calledWith({ where: { name } }), true)
      t.equal(userCreateSpy.calledWith({ data: { name } }), true)
      t.equal(
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

    await t.test('should add the strategy to the user', async (t) => {
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
            provider: 'discord',
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
        { accessToken: '123', current: userExample, currentStrategy: 'local' }
      )
      t.equal(result, 'success')
      t.equal(
        oAuthCreateSpy.calledWith({
          data: {
            userId: userExample.id,
            provider: 'discord',
            providerId: id
          }
        }),
        true
      )
      t.equal(
        oAuthFindFirstSpy.calledWith({
          where: {
            provider: 'discord',
            providerId: id
          }
        }),
        true
      )
    })

    await t.test(
      'should not add the strategy if the account of the provider is already used',
      async (t) => {
        const name = userExample.name
        const id = '12345'
        sinon.stub(prisma, 'oAuth').value({
          findFirst: async () => {
            return {
              id: 1,
              userId: 2,
              provider: 'discord',
              providerId: id,
              updatedAt: new Date(),
              createdAt: new Date()
            }
          }
        })
        const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
        const result = await oauthStrategy.callbackAddStrategy(
          { id, name },
          { accessToken: '123', current: userExample, currentStrategy: 'local' }
        )
        t.equal(result, 'This account is already used by someone else')
        t.equal(
          oAuthFindFirstSpy.calledWith({
            where: {
              provider: 'discord',
              providerId: id
            }
          }),
          true
        )
      }
    )

    await t.test(
      'should not add the strategy if the user is already connected with it',
      async (t) => {
        const name = userExample.name
        const id = '12345'
        sinon.stub(prisma, 'oAuth').value({
          findFirst: async () => {
            return {
              id: 1,
              userId: userExample.id,
              provider: 'discord',
              providerId: id,
              updatedAt: new Date(),
              createdAt: new Date()
            }
          }
        })
        const oAuthFindFirstSpy = sinon.spy(prisma.oAuth, 'findFirst')
        const result = await oauthStrategy.callbackAddStrategy(
          { id, name },
          { accessToken: '123', current: userExample, currentStrategy: 'local' }
        )
        t.equal(result, 'You are already using this account')
        t.equal(
          oAuthFindFirstSpy.calledWith({
            where: {
              provider: 'discord',
              providerId: id
            }
          }),
          true
        )
      }
    )
  })
})
