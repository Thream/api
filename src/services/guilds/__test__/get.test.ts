import { application } from '../../../application.js'
import { authenticateUserTest } from '../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../__test__/setup.js'
import { guildExample } from '../../../models/Guild.js'
import { memberExample } from '../../../models/Member.js'
import { channelExample } from '../../../models/Channel.js'

describe('GET /guilds', () => {
  it('succeeds', async () => {
    prismaMock.guild.findUnique.mockResolvedValue(guildExample)
    prismaMock.member.findMany.mockResolvedValue([memberExample])
    prismaMock.channel.findFirst.mockResolvedValue(channelExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {}
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.length).toEqual(1)
    expect(responseJson[0].name).toEqual(guildExample.name)
    expect(responseJson[0].description).toEqual(guildExample.description)
    expect(responseJson[0].defaultChannelId).toEqual(channelExample.id)
  })
})
