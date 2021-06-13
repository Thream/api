import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import application from '../../../../../application'
import { createInvitation } from '../../../__test__/utils/createInvitation'
import Member from '../../../../../models/Member'
import { wait } from '../../../../../__test__/utils/wait'

describe('GET /invitations/join/:value', () => {
  it('succeeds and create a new member', async () => {
    const userToken = await authenticateUserTest()
    const result = await createInvitation()
    await request(application)
      .get(`/invitations/join/${result?.invitation.value as string}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(201)
    const foundMember = await Member.findOne({
      where: { userId: userToken.userId, guildId: result?.guild.id as number }
    })
    expect(foundMember).not.toBeNull()
  })

  it("fails if the invitation doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get('/invitations/join/somevalue')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it('fails if the invitation expired', async () => {
    const userToken = await authenticateUserTest()
    const result = await createInvitation({ expiresIn: 100 })
    await wait(200)
    const response = await request(application)
      .get(`/invitations/join/${result?.invitation.value as string}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['The invitation expired']))
  })
})
