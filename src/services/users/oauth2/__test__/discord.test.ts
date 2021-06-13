import request from 'supertest'
import axios from 'axios'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import { authorizedRedirectDomains } from '../../../../tools/configurations/constants'
import { DISCORD_PROVIDER } from '../discord'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe(`/users/oauth2/${DISCORD_PROVIDER}`, () => {
  test(`GET /users/oauth2/${DISCORD_PROVIDER}/add-strategy`, async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get(
        `/users/oauth2/${DISCORD_PROVIDER}/add-strategy?redirectURI=${authorizedRedirectDomains[0]}`
      )
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
    expect(typeof response.body).toEqual('string')
  })

  test(`GET /users/oauth2/${DISCORD_PROVIDER}/callback-add-strategy`, async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'randomid',
        username: 'John',
        discriminator: '1234'
      }
    })
    mockedAxios.post.mockResolvedValue({
      data: {
        token_type: 'Bearer',
        access_token: 'randomtoken'
      }
    })
    const userToken = await authenticateUserTest()
    await request(application)
      .get(
        `/users/oauth2/${DISCORD_PROVIDER}/callback-add-strategy?redirectURI=${authorizedRedirectDomains[0]}&code=randomtokencode&state=${userToken.accessToken}`
      )
      .send()
      .expect(302)
    jest.resetAllMocks()
  })

  test(`GET /users/oauth2/${DISCORD_PROVIDER}/signin`, async () => {
    const response = await request(application)
      .get(
        `/users/oauth2/${DISCORD_PROVIDER}/signin?redirectURI=${authorizedRedirectDomains[0]}`
      )
      .send()
      .expect(200)
    expect(typeof response.body).toEqual('string')
  })

  test(`GET /users/oauth2/${DISCORD_PROVIDER}/callback`, async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'randomid',
        username: 'John',
        discriminator: '1234'
      }
    })
    mockedAxios.post.mockResolvedValue({
      data: {
        token_type: 'Bearer',
        access_token: 'randomtoken'
      }
    })
    await request(application)
      .get(
        `/users/oauth2/${DISCORD_PROVIDER}/callback?redirectURI=${authorizedRedirectDomains[0]}&code=randomtokencode`
      )
      .send()
      .expect(302)
    jest.resetAllMocks()
  })
})
