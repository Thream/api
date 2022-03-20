import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { memberExample } from '../../../../../models/Member.js'
import { guildExample } from '../../../../../models/Guild.js'
import { channelExample } from '../../../../../models/Channel.js'

const defaultChannelId = 5

await tap.test('POST /guilds/[guildId]/channels', async (t) => {
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
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId
        }
      },
      create: async () => {
        return channelExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 201)
    t.equal(responseJson.id, channelExample.id)
    t.equal(responseJson.name, channelExample.name)
    t.equal(responseJson.guildId, channelExample.guildId)
    t.equal(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test('fails if the member is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not owner', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: false
        }
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    t.equal(response.statusCode, 400)
  })
})
