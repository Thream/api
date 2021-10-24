import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import RefreshToken from '../../../../models/RefreshToken'

describe('DELETE /users/signout', () => {
  it('succeeds and signout to every devices', async () => {
    const email = 'johdoe@gmail.com'
    const name = 'johndoe'
    const password = 'test'
    const userToken = await authenticateUserTest({
      name,
      email,
      password,
      shouldBeConfirmed: true
    })
    await authenticateUserTest({ name, email, password, alreadySignedUp: true })
    let refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(2)
    await request(application)
      .delete('/users/signout')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
    refreshToken = await RefreshToken.findAll()
    expect(refreshToken.length).toEqual(0)
  })
})
