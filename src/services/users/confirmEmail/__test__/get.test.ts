import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import User from '../../../../models/User'

describe('GET /users/confirmEmail', () => {
  it('succeeds and confirm the user', async () => {
    const name = 'John'
    await authenticateUserTest({
      name,
      email: 'contact@john.com',
      shouldBeConfirmed: false
    })

    const user = await User.findOne({ where: { name } })
    expect(user).not.toBeNull()
    expect(user?.isConfirmed).toBe(false)
    await request(application)
      .get(`/users/confirmEmail?tempToken=${user?.tempToken as string}`)
      .send()
      .expect(200)

    const foundUser = await User.findOne({ where: { name } })
    expect(foundUser).not.toBeNull()
    expect(foundUser?.isConfirmed).toBe(true)
    expect(foundUser?.tempToken).toBe(null)
  })

  it('fails with invalid tempToken', async () => {
    await request(application)
      .get('/users/confirmEmail?tempToken=mybadtoken')
      .send()
      .expect(403)
  })

  it('fails with empty tempToken', async () => {
    await request(application)
      .get('/users/confirmEmail')
      .send()
      .expect(400)
  })
})
