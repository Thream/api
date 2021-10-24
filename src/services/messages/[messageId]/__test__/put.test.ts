import request from 'supertest'

import application from '../../../../application'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import { createMessages } from '../../__test__/utils/createMessages'

describe('PUT /messages/:messageId', () => {
  it('succeeds and edit the message', async () => {
    const value = 'awesome message'
    const result = await createMessages(['awesome'])
    const messageToEdit = result.messages[0]
    const response = await request(application)
      .put(`/messages/${messageToEdit.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(200)
    expect(response.body.message).not.toBeNull()
    expect(response.body.message.value).toEqual(value)
  })

  it('fails with no message value', async () => {
    const result = await createMessages(['awesome'])
    const messageToEdit = result.messages[0]
    const response = await request(application)
      .put(`/messages/${messageToEdit.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('value', { min: 1, max: 50_000 })
      ])
    )
  })
})
