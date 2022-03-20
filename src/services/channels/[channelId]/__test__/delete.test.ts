import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { channelExample } from '../../../../models/Channel.js'
import { memberExample } from '../../../../models/Member.js'

await tap.test('DELETE /channels/[channelId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const defaultChannelId = 5
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      },
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId
        }
      },
      count: async () => {
        return 2
      },
      delete: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.id, channelExample.id)
    t.equal(responseJson.name, channelExample.name)
    t.equal(responseJson.guildId, channelExample.guildId)
    t.equal(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test('fails if there is only one channel', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      },
      count: async () => {
        return 1
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 400)
  })

  await t.test('fails if the channel is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not found', async (t) => {
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
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not owner', async (t) => {
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
          isOwner: false
        }
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 400)
  })
})
