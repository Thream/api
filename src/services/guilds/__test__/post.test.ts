import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../application.js'
import { authenticateUserTest } from '../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../tools/database/prisma.js'
import { memberExample } from '../../../models/Member.js'
import { guildExample } from '../../../models/Guild.js'
import { channelExample } from '../../../models/Channel.js'
import { userExample } from '../../../models/User.js'

await tap.test('POST /guilds', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken, user } = await authenticateUserTest()
    sinon.stub(prisma, 'guild').value({
      create: async () => {
        return guildExample
      }
    })
    sinon.stub(prisma, 'member').value({
      create: async () => {
        return memberExample
      },
      findUnique: async () => {
        return {
          ...memberExample,
          ...userExample
        }
      }
    })
    sinon.stub(prisma, 'channel').value({
      create: async () => {
        return channelExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: guildExample.name,
        description: guildExample.description
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 201)
    t.equal(responseJson.guild.id, guildExample.id)
    t.equal(responseJson.guild.name, guildExample.name)
    t.equal(responseJson.guild.description, guildExample.description)
    t.equal(responseJson.guild.members.length, 1)
    t.equal(responseJson.guild.members[0].userId, user.id)
    t.equal(responseJson.guild.members[0].user.name, user.name)
    t.equal(responseJson.guild.members[0].guildId, guildExample.id)
    t.equal(responseJson.guild.members[0].isOwner, memberExample.isOwner)
    t.equal(responseJson.guild.channels.length, 1)
    t.equal(responseJson.guild.channels[0].id, channelExample.id)
    t.equal(responseJson.guild.channels[0].guildId, guildExample.id)
  })

  await t.test('fails with empty name and description', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 400)
  })
})
