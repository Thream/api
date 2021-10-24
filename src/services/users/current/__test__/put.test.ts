import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { userExample } from '../../../../models/User.js'

describe('PUT /users/current', () => {
  it('succeeds with valid accessToken and valid name', async () => {
    const newName = 'John Doe'
    const { accessToken, user } = await authenticateUserTest()
    prismaMock.user.update.mockResolvedValue({
      ...user,
      name: newName
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.user.name).toEqual(newName)
  })

  it('succeeds and only update the status', async () => {
    const newStatus = '👀 Working on secret projects...'
    const { accessToken, user } = await authenticateUserTest()
    prismaMock.user.update.mockResolvedValue({
      ...user,
      status: newStatus
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        status: newStatus
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.user.name).toEqual(user.name)
    expect(responseJson.user.status).toEqual(newStatus)
  })

  it('fails with name already used', async () => {
    const newName = 'John Doe'
    prismaMock.user.findFirst.mockResolvedValue(userExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName
      }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('fails with invalid website url', async () => {
    const newWebsite = 'invalid website url'
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        website: newWebsite
      }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('suceeds with valid website url', async () => {
    const newWebsite = 'https://somerandomwebsite.com'
    const { accessToken, user } = await authenticateUserTest()
    prismaMock.user.update.mockResolvedValue({
      ...user,
      website: newWebsite
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        website: newWebsite
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.user.name).toEqual(user.name)
    expect(responseJson.user.website).toEqual(newWebsite)
  })
})
