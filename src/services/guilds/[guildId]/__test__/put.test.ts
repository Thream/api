import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { memberExample } from '../../../../models/Member.js'
import { guildExample } from '../../../../models/Guild.js'
import { channelExample } from '../../../../models/Channel.js'

const defaultChannelId = 5
const newName = 'New guild name'
const newDescription = 'New guild description'

await tap.test('PUT /guilds/[guildId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds and edit the guild', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: true,
          guild: guildExample
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
    sinon.stub(prisma, 'guild').value({
      update: async () => {
        return {
          ...guildExample,
          name: newName,
          description: newDescription
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.name, newName)
    t.equal(responseJson.description, newDescription)
    t.equal(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test("fails if the guild doesn't exist", async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the user is not the owner', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: false,
          guild: guildExample
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 400)
    t.equal(responseJson.message, 'You should be an owner of the guild')
  })
})
