import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { channelExample } from '../../../../../models/Channel.js'
import { userExample } from '../../../../../models/User.js'
import { memberExample } from '../../../../../models/Member.js'
import { messageExample } from '../../../../../models/Message.js'

describe('GET /channels/[channelId]/messages', () => {
  it('succeeds', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    prismaMock.message.findMany.mockResolvedValue([messageExample])
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.length).toEqual(1)
    expect(responseJson[0].id).toEqual(messageExample.id)
    expect(responseJson[0].value).toEqual(messageExample.value)
    expect(responseJson[0].type).toEqual(messageExample.type)
    expect(responseJson[0].mimetype).toEqual(messageExample.mimetype)
    expect(responseJson[0].member.id).toEqual(memberExample.id)
    expect(responseJson[0].member.isOwner).toEqual(memberExample.isOwner)
    expect(responseJson[0].member.user.id).toEqual(userExample.id)
    expect(responseJson[0].member.user.name).toEqual(userExample.name)
  })

  it('fails with not found channel', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
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
      url: `/channels/${channelExample.id}/messages`,
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
      url: '/channels/1/messages'
    })
    expect(response.statusCode).toEqual(401)
  })
})
