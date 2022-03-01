import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { channelExample } from '../../../../../models/Channel.js'
import { memberExample } from '../../../../../models/Member.js'
import { guildExample } from '../../../../../models/Guild.js'

describe('POST /guilds/[guildId]/channels', () => {
  it('succeeds', async () => {
    const defaultChannelId = 5
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    prismaMock.channel.create.mockResolvedValue(channelExample)
    prismaMock.channel.findFirst.mockResolvedValue({
      ...channelExample,
      id: defaultChannelId
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(201)
    expect(responseJson.id).toEqual(channelExample.id)
    expect(responseJson.name).toEqual(channelExample.name)
    expect(responseJson.guildId).toEqual(channelExample.guildId)
    expect(responseJson.defaultChannelId).toEqual(defaultChannelId)
  })

  it('fails if the member is not found', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not owner', async () => {
    const member = {
      ...memberExample,
      isOwner: false
    }
    prismaMock.member.findFirst.mockResolvedValue(member)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { name: channelExample.name }
    })
    expect(response.statusCode).toEqual(400)
  })
})
