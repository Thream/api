import request from 'supertest'

import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import User from '../../../../models/User'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { errorsMessages } from '../post'

describe('POST /users/signup', () => {
  it('succeeds and create a new user', async () => {
    let users = await User.findAll()
    expect(users.length).toEqual(0)

    await request(application)
      .post('/users/signup')
      .send({
        name: 'John',
        email: 'contact@test.com',
        password: 'test'
      })
      .expect(201)

    users = await User.findAll()
    expect(users.length).toEqual(1)
  })

  it('fails with invalid email', async () => {
    let users = await User.findAll()
    expect(users.length).toEqual(0)

    const response = await request(application)
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

    users = await User.findAll()
    expect(users.length).toEqual(0)
  })

  it('fails with invalid name', async () => {
    let users = await User.findAll()
    expect(users.length).toEqual(0)

    const response = await request(application)
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

    users = await User.findAll()
    expect(users.length).toEqual(0)
  })

  it('fails with invalid name and invalid email', async () => {
    let users = await User.findAll()
    expect(users.length).toEqual(0)

    const response = await request(application)
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

    users = await User.findAll()
    expect(users.length).toEqual(0)
  })

  it('fails with name and email already used', async () => {
    const name = 'John'
    const email = 'contact@test.com'
    await request(application)
      .post('/users/signup')
      .send({
        name,
        email,
        password: 'test'
      })
      .expect(201)

    const response = await request(application)
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
