import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { channelExample } from '../../../../models/Channel.js'
import { memberExample } from '../../../../models/Member.js'

await tap.test('GET /channels/[channelId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.channel.id, channelExample.id)
    t.equal(responseJson.channel.name, channelExample.name)
    t.equal(responseJson.channel.guildId, channelExample.guildId)
  })

  await t.test('fails with not found member', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Channel not found')
  })

  await t.test('fails with not found channel', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return null
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Channel not found')
  })

  await t.test('fails with unauthenticated user', async (t) => {
    const response = await application.inject({
      method: 'GET',
      url: '/channels/1'
    })
    t.equal(response.statusCode, 401)
  })
})
