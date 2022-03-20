import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { channelExample } from '../../../../../models/Channel.js'
import { memberExample } from '../../../../../models/Member.js'
import { userExample } from '../../../../../models/User.js'
import { messageExample } from '../../../../../models/Message.js'

await tap.test('GET /channels/[channelId]/messages', async (t) => {
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
        return {
          ...memberExample,
          user: userExample
        }
      }
    })
    sinon.stub(prisma, 'message').value({
      findMany: async () => {
        return [messageExample]
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.length, 1)
    t.equal(responseJson[0].id, messageExample.id)
    t.equal(responseJson[0].value, messageExample.value)
    t.equal(responseJson[0].type, messageExample.type)
    t.equal(responseJson[0].mimetype, messageExample.mimetype)
    t.equal(responseJson[0].member.id, memberExample.id)
    t.equal(responseJson[0].member.isOwner, memberExample.isOwner)
    t.equal(responseJson[0].member.user.id, userExample.id)
    t.equal(responseJson[0].member.user.name, userExample.name)
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
        return {
          ...memberExample,
          user: userExample
        }
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Channel not found')
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
      url: `/channels/${channelExample.id}/messages`,
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
      url: `/channels/1/messages`
    })
    t.equal(response.statusCode, 401)
  })
})
