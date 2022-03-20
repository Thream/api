import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { memberExample } from '../../../../models/Member.js'
import { guildExample } from '../../../../models/Guild.js'

await tap.test('DELETE /guilds/[guildId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds and delete the guild', async (t) => {
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
    sinon.stub(prisma, 'guild').value({
      delete: async () => {
        return guildExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.id, guildExample.id)
    t.equal(responseJson.name, guildExample.name)
    t.equal(responseJson.description, guildExample.description)
  })

  await t.test("fails if the guild doesn't exist", async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
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
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 400)
    t.equal(responseJson.message, 'You should be an owner of the guild')
  })
})
