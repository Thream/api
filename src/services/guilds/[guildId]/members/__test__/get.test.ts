import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { memberExample } from '../../../../../models/Member.js'
import { guildExample } from '../../../../../models/Guild.js'
import { userExample } from '../../../../../models/User.js'

await tap.test('GET /guilds/[guildId]/members', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      },
      findMany: async () => {
        return [{ ...memberExample, user: userExample }]
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${guildExample.id}/members`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.length, 1)
    t.equal(responseJson[0].id, memberExample.id)
    t.equal(responseJson[0].isOwner, memberExample.isOwner)
    t.equal(responseJson[0].user.id, userExample.id)
    t.equal(responseJson[0].user.name, userExample.name)
    t.equal(responseJson[0].user.email, null)
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
      url: '/guilds/1/members',
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
      url: '/guilds/1/members'
    })
    t.equal(response.statusCode, 401)
  })
})
