import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'

describe('GET /users/current', () => {
  it('succeeds with valid Bearer accessToken', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.settings).not.toBeNull()
    expect(response.body.currentStrategy).toEqual('local')
    expect(Array.isArray(response.body.strategies)).toBeTruthy()
    expect(response.body.strategies.includes('local')).toBeTruthy()
  })

  it('fails with unconfirmed account', async () => {
    const userToken = await authenticateUserTest({ shouldBeConfirmed: false })
    const response = await request(application)
      .get('/users/current')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(401)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails ForbiddenError with invalid Bearer accessToken', async () => {
    await request(application)
      .get('/users/current')
      .set('Authorization', 'Bearer invalidtoken')
      .send()
      .expect(403)
  })

  it('fails NotAuthorizedError with invalid accessToken', async () => {
    await request(application)
      .get('/users/current')
      .set('Authorization', 'invalidtoken')
      .send()
      .expect(401)
  })
})
