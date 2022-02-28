import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { messageExample } from '../../../../models/Message.js'
import { memberExample } from '../../../../models/Member.js'
import { userExample } from '../../../../models/User.js'
import { channelExample } from '../../../../models/Channel.js'

describe('DELETE /messsages/[messageId]', () => {
  it('succeeds', async () => {
    prismaMock.message.findFirst.mockResolvedValue({
      ...messageExample,
      channel: channelExample
    } as any)
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      user: userExample
    } as any)
    prismaMock.message.delete.mockResolvedValue(messageExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.id).toEqual(messageExample.id)
    expect(responseJson.value).toEqual(messageExample.value)
    expect(responseJson.type).toEqual(messageExample.type)
    expect(responseJson.mimetype).toEqual(messageExample.mimetype)
    expect(responseJson.member.id).toEqual(memberExample.id)
    expect(responseJson.member.isOwner).toEqual(memberExample.isOwner)
    expect(responseJson.member.user.id).toEqual(userExample.id)
    expect(responseJson.member.user.name).toEqual(userExample.name)
  })

  it('fails if the message is not found', async () => {
    prismaMock.message.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not found', async () => {
    prismaMock.message.findFirst.mockResolvedValue({
      ...messageExample,
      channel: channelExample
    } as any)
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is not owner of the message', async () => {
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
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
