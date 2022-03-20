import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../application.js'
import { authenticateUserTest } from '../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../tools/database/prisma.js'
import { memberExample } from '../../../models/Member.js'
import { guildExample } from '../../../models/Guild.js'
import { channelExample } from '../../../models/Channel.js'

await tap.test('GET /guilds', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'guild').value({
      findUnique: async () => {
        return guildExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findMany: async () => {
        return [memberExample]
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return channelExample
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.length, 1)
    t.equal(responseJson[0].name, guildExample.name)
    t.equal(responseJson[0].description, guildExample.description)
    t.equal(responseJson[0].defaultChannelId, channelExample.id)
  })
})
