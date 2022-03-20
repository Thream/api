import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../../application.js'
import { authenticateUserTest } from '../../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../../tools/database/prisma.js'
import { memberExample } from '../../../../../../models/Member.js'
import { guildExample } from '../../../../../../models/Guild.js'
import { userExample } from '../../../../../../models/User.js'
import { channelExample } from '../../../../../../models/Channel.js'

const defaultChannelId = 5

await tap.test('POST /guilds/[guildId]/members/join', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      },
      create: async () => {
        return { ...memberExample, user: userExample }
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'guild').value({
      findUnique: async () => {
        return guildExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/members/join`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 201)
    t.equal(responseJson.id, memberExample.id)
    t.equal(responseJson.userId, memberExample.userId)
    t.equal(responseJson.user.name, userExample.name)
    t.equal(responseJson.user.email, null)
    t.equal(responseJson.guild.id, guildExample.id)
    t.equal(responseJson.guild.name, guildExample.name)
    t.equal(responseJson.guild.defaultChannelId, channelExample.id)
  })

  await t.test('fails if the guild is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return null
      }
    })
    sinon.stub(prisma, 'guild').value({
      findUnique: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/members/join`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the user is already in the guild', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId
        }
      }
    })
    sinon.stub(prisma, 'guild').value({
      findUnique: async () => {
        return guildExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/members/join`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 400)
    t.equal(responseJson.defaultChannelId, defaultChannelId)
  })
})
