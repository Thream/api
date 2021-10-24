import { application } from '../../../application.js'
import { authenticateUserTest } from '../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../__test__/setup.js'
import { guildExample } from '../../../models/Guild.js'
import { memberExample } from '../../../models/Member.js'
import { channelExample } from '../../../models/Channel.js'
import { userExample } from '../../../models/User.js'

describe('POST /guilds', () => {
  it('succeeds', async () => {
    prismaMock.guild.create.mockResolvedValue(guildExample)
    prismaMock.member.create.mockResolvedValue(memberExample)
    prismaMock.member.findUnique.mockResolvedValue({
      ...memberExample,
      ...userExample
    })
    prismaMock.channel.create.mockResolvedValue(channelExample)
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: guildExample.name,
        description: guildExample.description
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(201)
    expect(responseJson.guild.id).toEqual(guildExample.id)
    expect(responseJson.guild.name).toEqual(guildExample.name)
    expect(responseJson.guild.members.length).toEqual(1)
    expect(responseJson.guild.members[0].userId).toEqual(user.id)
    expect(responseJson.guild.members[0].user.name).toEqual(user.name)
    expect(responseJson.guild.members[0].guildId).toEqual(guildExample.id)
    expect(responseJson.guild.members[0].isOwner).toEqual(memberExample.isOwner)
    expect(responseJson.guild.channels.length).toEqual(1)
    expect(responseJson.guild.channels[0].id).toEqual(channelExample.id)
    expect(responseJson.guild.channels[0].guildId).toEqual(guildExample.id)
  })

  it('fails with empty name and description', async () => {
    prismaMock.guild.create.mockResolvedValue(guildExample)
    prismaMock.member.create.mockResolvedValue(memberExample)
    prismaMock.channel.create.mockResolvedValue(channelExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
