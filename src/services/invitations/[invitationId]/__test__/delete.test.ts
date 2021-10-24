import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import { createInvitation } from '../../__test__/utils/createInvitation'
import Invitation from '../../../../models/Invitation'

describe('DELETE /invitations/:invitationId', () => {
  it('succeeds and delete the invitation', async () => {
    const result = await createInvitation()
    const response = await request(application)
      .delete(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${result?.user.type as string} ${result?.user.accessToken as string}`)
      .send()
      .expect(200)
    expect(response.body.deletedInvitationId).toEqual(result?.invitation.id)
    const foundInvitation = await Invitation.findOne({
      where: { id: result?.invitation.id }
    })
    expect(foundInvitation).toBeNull()
  })

  it("fails if the invitation doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .delete('/invitations/23')
      .set('Authorization', `${userToken.type as string} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it('fails if the user is not the owner', async () => {
    const userToken = await authenticateUserTest()
    const result = await createInvitation()
    const response = await request(application)
      .delete(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${userToken.type as string} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
