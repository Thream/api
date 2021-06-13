import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import User from '../../../../models/User'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { randomString } from '../../../../tools/utils/random'
import { errorsMessages } from '../index'

describe('PUT /users/current', () => {
  it('succeeds with valid accessToken, valid email and valid name', async () => {
    const name = 'test2'
    const email = 'test2@test2.com'
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name, email })
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.name).toBe(name)
    expect(response.body.user.email).toBe(email)
    expect(response.body.currentStrategy).not.toBeNull()
  })

  it('succeeds and only change the email', async () => {
    const name = 'John'
    const email = 'contact@test.com'
    const userToken = await authenticateUserTest({
      name,
      email
    })
    let user = (await User.findAll())[0]
    expect(user.email).toEqual(email)
    expect(user.name).toEqual(name)

    const email2 = 'test2@test2.com'
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ email: email2 })
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.email).toEqual(email2)
    expect(response.body.user.name).toEqual(name)

    user = (await User.findAll())[0]
    expect(user.email).toEqual(email2)
    expect(user.name).toEqual(name)
    expect(user.isConfirmed).toBe(false)
  })

  it('succeeds and only change the name', async () => {
    const name = 'John'
    const email = 'contact@test.com'
    const userToken = await authenticateUserTest({
      name,
      email
    })
    let user = (await User.findAll())[0]
    expect(user.email).toEqual(email)
    expect(user.name).toEqual(name)

    const name2 = 'test2'
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name: name2 })
      .expect(200)
    expect(response.body.user).not.toBeNull()

    user = (await User.findAll())[0]
    expect(user.email).toEqual(email)
    expect(user.name).toEqual(name2)
  })

  it('succeeds and only change the status', async () => {
    const userToken = await authenticateUserTest()
    const status = '👀 Working on secret projects...'
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ status })
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.status).toBe(status)
  })

  it('succeeds and only change the biography', async () => {
    const userToken = await authenticateUserTest()
    const biography = 'My awesome biography'
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ biography })
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.biography).toBe(biography)
  })

  it('fails with unconfirmed account', async () => {
    const userToken = await authenticateUserTest({
      name: 'John',
      email: 'contact@john.com',
      shouldBeConfirmed: false
    })
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(401)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails with invalid status', async () => {
    const userToken = await authenticateUserTest()
    const status = randomString(110)
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ status })
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toEqual(
      commonErrorsMessages.charactersLength('status', { max: 100 })
    )
  })

  it('fails with invalid biography', async () => {
    const userToken = await authenticateUserTest()
    const biography = randomString(170)
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ biography })
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toEqual(
      commonErrorsMessages.charactersLength('biography', { max: 160 })
    )
  })

  it('fails with invalid name and invalid email', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({
        name: 'jo',
        email: 'test2@test2'
      })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(2)
    expect(errors).toEqual(
      expect.arrayContaining([
        errorsMessages.email.mustBeValid,
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      ])
    )
  })

  it('fails with name and email already used', async () => {
    const firstUserName = 'Test'
    const firstUserEmail = 'test@test.com'
    await authenticateUserTest({
      name: firstUserName,
      email: firstUserEmail,
      shouldBeConfirmed: true
    })
    const secondUserToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current')
      .set(
        'Authorization',
        `${secondUserToken.type} ${secondUserToken.accessToken}`
      )
      .send({
        name: firstUserName,
        email: firstUserEmail
      })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(2)
    expect(errors).toEqual(
      expect.arrayContaining(['Name already used', 'Email already used'])
    )
  })

  it('fails with name identical to the current user name', async () => {
    const name = 'Test'
    const email = 'test@test.com'
    const userToken = await authenticateUserTest({
      name,
      email
    })
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name })
      .expect(400)

    const errors = formatErrors(response.body.errors)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.name.alreadyConnected])
    )
  })

  it('fails with email identical to the current user email', async () => {
    const name = 'Test'
    const email = 'test@test.com'
    const userToken = await authenticateUserTest({
      name,
      email
    })
    const response = await request(application)
      .put('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ email })
      .expect(400)

    const errors = formatErrors(response.body.errors)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.email.alreadyConnected])
    )
  })
})
