import request from 'supertest'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import app from '../../../app'

describe('POST /users/refresh-token', () => {
  it('succeeds and generate a new accessToken with a valid refreshToken', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(app)
      .post('/users/refresh-token')
      .send({
        refreshToken: userToken.refreshToken
      })
      .expect(200)
    expect(response.body.accessToken).not.toBeNull()
  })

  it('fails with invalid refreshToken', async () => {
    await request(app)
      .post('/users/refresh-token')
      .send({
        refreshToken: 'invalidtoken'
      })
      .expect(401)
  })
})
