import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { memberExample } from '../../../../models/Member.js'
import { guildExample } from '../../../../models/Guild.js'
import { userExample } from '../../../../models/User.js'
import { channelExample } from '../../../../models/Channel.js'

const defaultChannelId = 5

await tap.test('GET /guilds/[guildId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken, user } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          guild: guildExample,
          user: userExample
        }
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
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.member.id, memberExample.id)
    t.equal(responseJson.member.isOwner, memberExample.isOwner)
    t.equal(responseJson.member.user.name, user.name)
    t.equal(responseJson.member.user.email, null)
    t.equal(responseJson.guild.id, guildExample.id)
    t.equal(responseJson.guild.name, guildExample.name)
    t.equal(responseJson.guild.defaultChannelId, defaultChannelId)
  })

  await t.test('fails with not found member/guild', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Member not found')
  })

  await t.test('fails with unauthenticated user', async (t) => {
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1'
    })
    t.equal(response.statusCode, 401)
  })
})
