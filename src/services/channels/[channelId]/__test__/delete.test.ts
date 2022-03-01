import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { channelExample } from '../../../../models/Channel.js'
import { memberExample } from '../../../../models/Member.js'

describe('DELETE /channels/[channelId]', () => {
  it('succeeds', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    prismaMock.channel.count.mockResolvedValue(2)
    prismaMock.channel.delete.mockResolvedValue(channelExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.id).toEqual(channelExample.id)
    expect(responseJson.name).toEqual(channelExample.name)
    expect(responseJson.guildId).toEqual(channelExample.guildId)
  })

  it('fails if there is only one channel', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    prismaMock.channel.count.mockResolvedValue(1)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('fails if the channel is not found', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not found', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not owner', async () => {
    const member = {
      ...memberExample,
      isOwner: false
    }
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(member)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
