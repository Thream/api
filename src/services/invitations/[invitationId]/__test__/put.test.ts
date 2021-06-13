import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import { createInvitation } from '../../__test__/utils/createInvitation'
import { errorsMessages } from '../put'

describe('PUT /invitations/:invitationId', () => {
  it('succeeds and edit the invitation', async () => {
    let value = 'random'
    let expiresIn = 0
    let isPublic = false
    const result = await createInvitation({ value, expiresIn, isPublic })
    expect(result?.invitation.value).toEqual(value)
    expect(result?.invitation.expiresIn).toEqual(expiresIn)
    expect(result?.invitation.isPublic).toEqual(isPublic)
    value = 'awesome'
    expiresIn = 60
    isPublic = true
    const response = await request(application)
      .put(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${result?.user.type as string} ${result?.user.accessToken as string}`)
      .send({ value, expiresIn, isPublic })
      .expect(200)
    expect(response.body.invitation.value).toEqual(value)
    expect(response.body.invitation.isPublic).toEqual(isPublic)
  })

  it('fails with invalid slug value', async () => {
    const result = await createInvitation()
    const response = await request(application)
      .put(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${result?.user.type as string} ${result?.user.accessToken as string}`)
      .send({ value: 'random invitation value' })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining([errorsMessages.value.mustBeSlug]))
  })

  it('fails with negative expiresIn', async () => {
    const result = await createInvitation()
    const response = await request(application)
      .put(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${result?.user.type as string} ${result?.user.accessToken as string}`)
      .send({ expiresIn: -42 })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining([errorsMessages.expiresIn.mustBeGreaterOrEqual]))
  })

  it("fails if the invitation doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/invitations/23')
      .set('Authorization', `${userToken.type as string} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it('fails if the invitation slug value already exists', async () => {
    const value = 'random'
    const result = await createInvitation({ value })
    const response = await request(application)
      .put(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${result?.user.type as string} ${result?.user.accessToken as string}`)
      .send({ value })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining(['Value already used'])
    )
  })

  it('fails if the user is not the owner', async () => {
    const userToken = await authenticateUserTest()
    const result = await createInvitation()
    const response = await request(application)
      .put(`/invitations/${result?.invitation.id as number}`)
      .set('Authorization', `${userToken.type as string} ${userToken.accessToken}`)
      .send({ value: 'somevalue' })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
