import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { memberExample } from '../../../../../models/Member.js'
import { guildExample } from '../../../../../models/Guild.js'
import { channelExample } from '../../../../../models/Channel.js'

await tap.test('GET /guilds/[guildId]/channels', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    sinon.stub(prisma, 'channel').value({
      findMany: async () => {
        return [channelExample]
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.length, 1)
    t.equal(responseJson[0].id, channelExample.id)
    t.equal(responseJson[0].name, channelExample.name)
    t.equal(responseJson[0].guildId, channelExample.guildId)
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
      url: '/guilds/1/channels',
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
      url: '/guilds/1/channels'
    })
    t.equal(response.statusCode, 401)
  })
})
