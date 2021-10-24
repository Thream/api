import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import RefreshToken from '../../../../models/RefreshToken'

describe('POST /users/signout', () => {
  it('succeeds and signout', async () => {
    const userToken = await authenticateUserTest()
    let refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(1)

    await request(application)
      .post('/users/signout')
      .send({ refreshToken: userToken.refreshToken })
      .expect(200)

    refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(0)
  })

  it('fails with invalid refreshToken', async () => {
    await authenticateUserTest()
    let refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(1)

    await request(application)
      .post('/users/signout')
      .send({ refreshToken: 'some invalid token' })
      .expect(401)

    refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(1)
  })
})
