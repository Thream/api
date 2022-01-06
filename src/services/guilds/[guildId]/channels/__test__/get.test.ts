import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { memberExample } from '../../../../../models/Member.js'
import { guildExample } from '../../../../../models/Guild.js'
import { channelExample } from '../../../../../models/Channel.js'

describe('GET /guilds/[guildId]/channels', () => {
  it('succeeds', async () => {
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    prismaMock.channel.findMany.mockResolvedValue([channelExample])
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.length).toEqual(1)
    expect(responseJson[0].id).toEqual(channelExample.id)
    expect(responseJson[0].name).toEqual(channelExample.name)
    expect(responseJson[0].guildId).toEqual(channelExample.guildId)
  })

  it('fails with not found guild', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1/channels',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Member not found')
  })

  it('fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1/channels'
    })
    expect(response.statusCode).toEqual(401)
  })
})
