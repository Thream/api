import ms from 'ms'
import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import { errorsMessages as errorsConfirmed } from '../../../../tools/middlewares/authenticateUser'
import User from '../../../../models/User'
import { errorsMessages } from '..'

describe('POST /users/resetPassword', () => {
  it('succeeds with valid email and generate a tempToken', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    await authenticateUserTest({ email, name, shouldBeConfirmed: true })
    const userBefore = await User.findOne({ where: { name } })
    expect(userBefore).not.toBeNull()
    expect(userBefore?.tempToken).toBe(null)
    expect(userBefore?.tempExpirationToken).toBe(null)

    await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(200)

    const userAfter = await User.findOne({ where: { name } })
    expect(userAfter?.tempToken).not.toBeNull()
    expect(userAfter?.tempExpirationToken).not.toBeNull()
  })

  it('succeeds even if there is already a password-reset request in progress (but outdated)', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    await authenticateUserTest({ email, name, shouldBeConfirmed: true })

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

    await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(200)
  })

  it("fails with email address that doesn't exist", async () => {
    const response = await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email: 'contact@test.com' })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(errorsMessages.email.notExist)
  })

  it('fails with unconfirmed account', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    await authenticateUserTest({ email, name, shouldBeConfirmed: false })

    const response = await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(errorsConfirmed.invalidAccount)
  })

  it('fails if there is already a password-reset request in progress', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    await authenticateUserTest({ email, name, shouldBeConfirmed: true })

    await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(200)

    const response = await request(application)
      .post('/users/resetPassword?redirectURI=someurl.com')
      .send({ email })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      errorsMessages.password.alreadyInProgress
    )
  })
})
