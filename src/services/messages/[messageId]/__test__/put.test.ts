import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { messageExample } from '../../../../models/Message.js'
import { memberExample } from '../../../../models/Member.js'
import { userExample } from '../../../../models/User.js'
import { channelExample } from '../../../../models/Channel.js'

describe('PUT /messsages/[messageId]', () => {
  it('succeeds', async () => {
    const newValue = 'some message'
    prismaMock.message.findFirst.mockResolvedValue({
      ...messageExample,
      channel: channelExample
    } as any)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    prismaMock.message.update.mockResolvedValue({
      ...messageExample,
      value: newValue
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: newValue
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.id).toEqual(messageExample.id)
    expect(responseJson.value).toEqual(newValue)
    expect(responseJson.type).toEqual(messageExample.type)
    expect(responseJson.mimetype).toEqual(messageExample.mimetype)
    expect(responseJson.member.id).toEqual(memberExample.id)
    expect(responseJson.member.isOwner).toEqual(memberExample.isOwner)
    expect(responseJson.member.user.id).toEqual(userExample.id)
    expect(responseJson.member.user.name).toEqual(userExample.name)
  })

  it('fails if the message is not found', async () => {
    const newValue = 'some message'
    prismaMock.message.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: newValue
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not found', async () => {
    const newValue = 'some message'
    prismaMock.message.findFirst.mockResolvedValue({
      ...messageExample,
      channel: channelExample
    } as any)
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: newValue
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not owner of the message', async () => {
    const newValue = 'some message'
    const randomUserIdOwnerOfMessage = 14
    prismaMock.message.findFirst.mockResolvedValue({
      ...messageExample,
      channel: channelExample
    } as any)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      userId: randomUserIdOwnerOfMessage
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        value: newValue
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
