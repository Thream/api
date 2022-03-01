import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { guildExample } from '../../../../models/Guild.js'
import { memberExample } from '../../../../models/Member.js'
import { channelExample } from '../../../../models/Channel.js'

describe('PUT /guilds/[guildId]', () => {
  it('succeeds and edit the guild', async () => {
    const defaultChannelId = 5
    const newName = 'New guild name'
    const newDescription = 'New guild description'
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      isOwner: true,
      guild: guildExample
    } as any)
    prismaMock.guild.update.mockResolvedValue({
      ...guildExample,
      name: newName,
      description: newDescription
    })
    prismaMock.channel.findFirst.mockResolvedValue({
      ...channelExample,
      id: defaultChannelId
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.name).toEqual(newName)
    expect(responseJson.description).toEqual(newDescription)
    expect(responseJson.defaultChannelId).toEqual(defaultChannelId)
  })

  it("fails if the guild doesn't exist", async () => {
    const newName = 'New guild name'
    const newDescription = 'New guild description'
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the user is not the owner', async () => {
    const newName = 'New guild name'
    const newDescription = 'New guild description'
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      isOwner: false,
      guild: guildExample
    } as any)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(400)
    expect(responseJson.message).toEqual('You should be an owner of the guild')
  })
})
