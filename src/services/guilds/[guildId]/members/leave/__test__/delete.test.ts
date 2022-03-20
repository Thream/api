import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../../application.js'
import { authenticateUserTest } from '../../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../../tools/database/prisma.js'
import { memberExample } from '../../../../../../models/Member.js'
import { guildExample } from '../../../../../../models/Guild.js'

await tap.test('DELETE /guilds/[guildId]/members/leave', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const member = {
      ...memberExample,
      isOwner: false
    }
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return member
      },
      delete: async () => {
        return member
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.id, member.id)
    t.equal(responseJson.isOwner, member.isOwner)
    t.equal(responseJson.userId, member.userId)
  })

  await t.test('fails if the member is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is owner', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const member = {
      ...memberExample,
      isOwner: true
    }
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return member
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 400)
  })
})
