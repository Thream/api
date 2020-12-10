import request from 'supertest'

import { formatErrors } from '../../../__test__/utils/formatErrors'
import app from '../../../app'
import User from '../../../models/User'
import { commonErrorsMessages } from '../../../utils/config/constants'
import { errorsMessages } from '../signup'

describe('POST /users/signup', () => {
  it('succeeds and create a new user', async () => {
    let user = await User.findAll()
    expect(user.length).toEqual(0)

    await request(app)
      .post('/users/signup')
      .send({
        name: 'John',
        email: 'contact@test.com',
        password: 'test'
      })
      .expect(201)

    user = await User.findAll()
    expect(user.length).toEqual(1)
  })

  it('fails with invalid email', async () => {
    let user = await User.findAll()
    expect(user.length).toEqual(0)

    const response = await request(app)
      .post('/users/signup')
      .send({
        name: 'Divlo',
        email: 'incorrect@email',
        password: 'test'
      })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      errorsMessages.email.mustBeValid
    )

    user = await User.findAll()
    expect(user.length).toEqual(0)
  })

  it('fails with invalid name', async () => {
    let user = await User.findAll()
    expect(user.length).toEqual(0)

    const response = await request(app)
      .post('/users/signup')
      .send({
        name: 'jo',
        email: 'contact@email.com',
        password: 'test'
      })
      .expect(400)

    expect(response.body.errors.length).toEqual(1)
    expect(response.body.errors[0].message).toBe(
      commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
    )

    user = await User.findAll()
    expect(user.length).toEqual(0)
  })

  it('fails with invalid name and invalid email', async () => {
    let user = await User.findAll()
    expect(user.length).toEqual(0)

    const response = await request(app)
      .post('/users/signup')
      .send({
        name: 'jo',
        email: 'contact@email',
        password: 'test'
      })
      .expect(400)

    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(2)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 }),
        errorsMessages.email.mustBeValid
      ])
    )

    user = await User.findAll()
    expect(user.length).toEqual(0)
  })

  it('fails with name and email already used', async () => {
    const name = 'John'
    const email = 'contact@test.com'
    await request(app)
      .post('/users/signup')
      .send({
        name,
        email,
        password: 'test'
      })
      .expect(201)

    const response = await request(app)
      .post('/users/signup')
      .send({
        name,
        email,
        password: 'test'
      })
      .expect(400)

    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(2)
    expect(errors).toEqual(
      expect.arrayContaining(['Name already used', 'Email already used'])
    )
  })
})
