import request from 'supertest'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../__test__/utils/formatErrors'
import application from '../../../application'
import { commonErrorsMessages } from '../../../tools/configurations/constants'
import { randomString } from '../../../tools/utils/random'

describe('POST /guilds', () => {
  it('succeeds with valid name/description', async () => {
    const name = 'Test'
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .post('/guilds')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name, description: 'testing guild creation' })
      .expect(201)
    expect(response.body.guild).not.toBeNull()
    expect(response.body.guild.name).toBe(name)
  })

  it('fails with invalid name', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .post('/guilds')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name: randomString(35), description: 'testing guild creation' })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      ])
    )
  })

  it('fails with name already used', async () => {
    const userToken = await authenticateUserTest()
    const name = 'guild'
    const response1 = await request(application)
      .post('/guilds')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name, description: 'testing guild creation' })
      .expect(201)
    expect(response1.body.guild.name).toBe(name)

    const response2 = await request(application)
      .post('/guilds')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name, description: 'testing guild creation' })
      .expect(400)

    const errors = formatErrors(response2.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Name already used']))
  })

  it('fails with invalid description', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .post('/guilds')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name: 'Test', description: randomString(165) })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual([
      commonErrorsMessages.charactersLength('description', { max: 160 })
    ])
  })
})
