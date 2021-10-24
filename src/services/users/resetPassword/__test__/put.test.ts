import ms from 'ms'
import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import User from '../../../../models/User'
import { errorsMessages } from '..'

describe('PUT /users/resetPassword', () => {
  it('succeeds and change the password so we can signin again', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    const password = 'test'
    await authenticateUserTest({
      name,
      email,
      password,
      shouldBeConfirmed: true
    })

    await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(200)

    const user = await User.findOne({ where: { name } })
    expect(user).not.toBeNull()

    const newPassword = 'newpassword'
    await request(application)
      .put('/users/resetPassword')
      .send({ password: newPassword, tempToken: user?.tempToken })
      .expect(200)

    await request(application)
      .post('/users/signin')
      .send({ email, password: newPassword })
      .expect(200)
  })

  it('fails with an invalid "tempToken"', async () => {
    const response = await request(application)
      .put('/users/resetPassword')
      .send({ password: 'newpassword', tempToken: 'sometemptoken' })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      errorsMessages.tempToken.invalid
    )
  })

  it('fails if there is no password and tempToken provided', async () => {
    const response = await request(application)
      .put('/users/resetPassword')
      .send()
      .expect(400)
    expect(response.body.errors.length).toEqual(2)
  })

  it('fails if the tempToken is outdated', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    const password = 'test'
    await authenticateUserTest({
      name,
      email,
      password,
      shouldBeConfirmed: true
    })

    await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(200)

    const user = await User.findOne({ where: { name } })
    expect(user).not.toBeNull()
    if (user != null) {
      user.tempExpirationToken = Date.now() - ms('2 hour')
      await user.save()
    }

    const newPassword = 'newpassword'
    const response = await request(application)
      .put('/users/resetPassword')
      .send({ password: newPassword, tempToken: user?.tempToken })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      errorsMessages.tempToken.invalid
    )
  })
})
