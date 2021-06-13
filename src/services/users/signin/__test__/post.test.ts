import bcrypt from 'bcryptjs'

import { application } from '../../../../application'
import { refreshTokenExample } from '../../../../models/RefreshToken'
import { userExample } from '../../../../models/User'
import { expiresIn } from '../../../../tools/utils/jwtToken'
import { prismaMock } from '../../../../__test__/setup'

const payload = {
  email: userExample.email,
  password: userExample.password
}

describe('POST /users/signin', () => {
  it('should succeeds', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userExample,
      password: await bcrypt.hash(userExample.password as string, 12)
    })
    prismaMock.refreshToken.create.mockResolvedValue(refreshTokenExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.type).toEqual('Bearer')
    expect(responseJson.expiresIn).toEqual(expiresIn)
  })

  it('should fails with invalid user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload
    })
    expect(response.statusCode).toEqual(400)
  })

  it('should fails with invalid email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload: {
        ...payload,
        email: 'incorrect-email'
      }
    })
    expect(response.statusCode).toEqual(400)
  })

  it("should fails if user hasn't got a password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userExample,
      password: null
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload: payload
    })
    expect(response.statusCode).toEqual(400)
  })

  it('should fails with incorrect password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signin',
      payload: {
        ...payload,
        password: userExample.password
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
