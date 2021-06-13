import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'

describe('POST /users/refreshToken', () => {
  it('succeeds and generate a new accessToken with a valid refreshToken', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .post('/users/refreshToken')
      .send({
        refreshToken: userToken.refreshToken
      })
      .expect(200)
    expect(response.body.accessToken).not.toBeNull()
  })

  it('fails with invalid refreshToken', async () => {
    await request(application)
      .post('/users/refreshToken')
      .send({
        refreshToken: 'invalidtoken'
      })
      .expect(401)
  })
})
