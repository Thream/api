import request from 'supertest'

import application from '../../../../application'
import User from '../../../../models/User'
import { generateAccessToken } from '../../../../tools/configurations/jwtToken'

describe('POST /users/addLocalStrategy', () => {
  it('succeeds and add local strategy', async () => {
    const user = await User.create({ name: 'John' })
    const accessToken = generateAccessToken({
      currentStrategy: 'github',
      id: user.id
    })
    const email = 'johndoe@example.com'
    const response = await request(application)
      .post('/users/addLocalStrategy')
      .send({
        email,
        password: 'password'
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.id).toEqual(user.id)
    expect(response.body.user.email).toEqual(email)
  })

  it('fails if the user is already using local strategy', async () => {
    const user = await User.create({ name: 'John' })
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    const email = 'johndoe@example.com'
    const response = await request(application)
      .post('/users/addLocalStrategy')
      .send({
        email,
        password: 'password'
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails with invalid email', async () => {
    const user = await User.create({ name: 'John' })
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    const email = 'johndoecom'
    const response = await request(application)
      .post('/users/addLocalStrategy')
      .send({
        email,
        password: 'password'
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails if the user is not connected', async () => {
    const email = 'johndoecom'
    const response = await request(application)
      .post('/users/addLocalStrategy')
      .send({
        email,
        password: 'password'
      })
      .set('Authorization', 'Bearer token')
      .expect(403)
    expect(response.body.errors.length).toEqual(1)
  })
})
