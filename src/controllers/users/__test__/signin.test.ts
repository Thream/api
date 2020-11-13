import request from 'supertest'

import app from '../../../app'
import User from '../../../models/User'
import { errorsMessages } from '../signin'

describe('POST /users/signin', () => {
  it('succeeds with valid credentials', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    const password = 'test'
    const response = await request(app)
      .post('/users/signup')
      .send({ name, email, password })
      .expect(201)

    const user = await User.findOne({ where: { id: response.body.user.id } })
    if (user != null) {
      await request(app)
        .get(`/users/confirm-email?tempToken=${user.tempToken as string}`)
        .send()
        .expect(200)
    }

    await request(app)
      .post('/users/signin')
      .send({ email, password })
      .expect(200)
  })

  it('fails with unconfirmed account and valid credentials', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    const password = 'test'
    await request(app)
      .post('/users/signup')
      .send({ name, email, password })
      .expect(201)

    await request(app)
      .post('/users/signin')
      .send({ email, password })
      .expect(400)
  })

  it('fails with invalid credentials', async () => {
    const email = 'contact@test.com'
    const name = 'John'
    const password = 'test'
    await request(app)
      .post('/users/signup')
      .send({ name, email, password })
      .expect(201)

    const response = await request(app)
      .post('/users/signin')
      .send({ email, password: 'some random password' })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      errorsMessages.invalidCredentials
    )
  })
})
