import request from 'supertest'

import application from '../../../../application'
import { createMessages } from '../../__test__/utils/createMessages'
import Message from '../../../../models/Message'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'

describe('DELETE /messages/:messageId', () => {
  it('succeeds and delete the message', async () => {
    const result = await createMessages(['awesome'])
    const messageToDelete = result.messages[0]
    const response = await request(application)
      .delete(`/messages/${messageToDelete.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.deletedMessageId).toEqual(messageToDelete.id)
    const foundMessage = await Message.findOne({
      where: { id: messageToDelete.id }
    })
    expect(foundMessage).toBeNull()
  })

  it("fails if the message doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .delete('/messages/23')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
