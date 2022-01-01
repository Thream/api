import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { channelExample } from '../../../../../models/Channel.js'
import { memberExample } from '../../../../../models/Member.js'
import { userExample } from '../../../../../models/User.js'
import { messageExample } from '../../../../../models/Message.js'

describe('POST /channels/[channelId]/messages', () => {
  it('succeeds', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    prismaMock.message.create.mockResolvedValue(messageExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: messageExample.value
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(201)
    expect(responseJson.id).toEqual(messageExample.id)
    expect(responseJson.value).toEqual(messageExample.value)
    expect(responseJson.type).toEqual(messageExample.type)
    expect(responseJson.mimetype).toEqual(messageExample.mimetype)
    expect(responseJson.member.id).toEqual(memberExample.id)
    expect(responseJson.member.isOwner).toEqual(memberExample.isOwner)
    expect(responseJson.member.user.id).toEqual(userExample.id)
    expect(responseJson.member.user.name).toEqual(userExample.name)
  })

  it('fails with no message value', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {}
    })
    expect(response.statusCode).toEqual(400)
  })

  it('fails with not found channel', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: '/channels/5/messages',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: messageExample.value
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Channel not found')
  })

  it('fails with not found member', async () => {
    prismaMock.channel.findUnique.mockResolvedValue(channelExample)
    prismaMock.member.findUnique.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: messageExample.value
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Channel not found')
  })
})
