import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { memberExample } from '../../../../models/Member'
import { channelExample } from '../../../../models/Channel.js'

describe('GET /channels/[channelId]', () => {
  it('succeeds', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.channel.id).toEqual(channelExample.id)
    expect(responseJson.channel.name).toEqual(channelExample.name)
    expect(responseJson.channel.guildId).toEqual(channelExample.guildId)
  })

  it('fails with not found member', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/channels/1',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Channel not found')
  })

  it('fails with not found member', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Channel not found')
  })

  it('fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: '/channels/1'
    })
    expect(response.statusCode).toEqual(401)
  })
})
