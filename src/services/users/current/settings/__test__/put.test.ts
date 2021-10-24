import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import application from '../../../../../application'

describe('PUT /users/current/settings', () => {
  it('should succeeds and edit theme, language and isPublicEmail', async () => {
    const isPublicEmail = true
    const theme = 'light'
    const language = 'fr'
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ isPublicEmail, theme, language })
      .expect(200)
    expect(response.body.settings).not.toBeNull()
    expect(response.body.settings.theme).toEqual(theme)
    expect(response.body.settings.language).toEqual(language)
    expect(response.body.settings.isPublicEmail).toEqual(isPublicEmail)
  })

  it('fails with unconfirmed account', async () => {
    const userToken = await authenticateUserTest({
      name: 'John',
      email: 'contact@john.com',
      shouldBeConfirmed: false
    })
    const response = await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(401)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails with invalid theme', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ theme: 'random theme value' })
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails with invalid language', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ language: 'random language value' })
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
  })

  it('fails with invalid isPublicEmail', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/users/current/settings')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ isPublicEmail: 'not a boolean value' })
      .expect(400)
    expect(response.body.errors.length).toEqual(1)
  })
})
