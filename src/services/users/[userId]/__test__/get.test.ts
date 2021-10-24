import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'

describe('GET /users/:userId', () => {
  it('should returns the user without the email', async () => {
    const { userId } = await authenticateUserTest()
    const response = await request(application)
      .get(`/users/${userId}`)
      .send()
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.email).toBeUndefined()
    expect(response.body.user.id).toEqual(userId)
  })

  it('should returns the user with the email', async () => {
    const userToken = await authenticateUserTest()
    await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ isPublicEmail: true })
      .expect(200)
    const response = await request(application)
      .get(`/users/${userToken.userId}`)
      .send()
      .expect(200)
    expect(response.body.user).not.toBeNull()
    expect(response.body.user.email).not.toBeNull()
    expect(response.body.user.id).toEqual(userToken.userId)
  })

  it("should returns 404 error if the user doesn't exist", async () => {
    const response = await request(application).get('/users/1').send().expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
