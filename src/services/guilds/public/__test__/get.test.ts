import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { guildExample } from '../../../../models/Guild.js'

await tap.test('GET /guilds/public', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'guild').value({
      findMany: async () => {
        return [guildExample]
      }
    })
    sinon.stub(prisma, 'member').value({
      count: async () => {
        return 2
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/public',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.length, 1)
    t.equal(responseJson[0].name, guildExample.name)
    t.equal(responseJson[0].membersCount, 2)
  })
})
