import { application } from '../../../../../../application.js'
import { authenticateUserTest } from '../../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../../__test__/setup.js'
import { guildExample } from '../../../../../../models/Guild.js'
import { channelExample } from '../../../../../../models/Channel.js'
import { memberExample } from '../../../../../../models/Member.js'
import { userExample } from '../../../../../../models/User.js'

describe('POST /guilds/[guildId]/members/join', () => {
  it('succeeds', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    prismaMock.member.create.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    prismaMock.channel.findFirst.mockResolvedValue(channelExample)
    prismaMock.guild.findUnique.mockResolvedValue(guildExample)
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/members/join`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(201)
    expect(responseJson.id).toEqual(memberExample.id)
    expect(responseJson.userId).toEqual(memberExample.userId)
    expect(responseJson.user.name).toEqual(user.name)
    expect(responseJson.user.email).toEqual(null)
    expect(responseJson.guild.id).toEqual(guildExample.id)
    expect(responseJson.guild.name).toEqual(guildExample.name)
    expect(responseJson.guild.defaultChannelId).toEqual(channelExample.id)
  })

  it('fails if the user is already in the guild', async () => {
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/guilds/${guildExample.id}/members/join`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
