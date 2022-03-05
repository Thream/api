import httpErrors from 'http-errors'
import jwt from 'jsonwebtoken'

import { userExample } from '../../../models/User.js'
import { prismaMock } from '../../../__test__/setup.js'
import { getUserWithBearerToken } from '../authenticateUser.js'

const { Unauthorized, Forbidden, BadRequest } = httpErrors

describe('tools/plugins/authenticateUser - getUserWithBearerToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shoulds succeeds with the right information', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    const currentStrategy = 'local'
    jwt.verify = jest.fn<any, any[]>((() => {
      return { id: userExample.id, currentStrategy }
    }) as any)
    const userWithBearerToken = await getUserWithBearerToken('Bearer token')
    expect(userWithBearerToken.current.id).toEqual(userExample.id)
    expect(userWithBearerToken.current.name).toEqual(userExample.name)
    expect(userWithBearerToken.accessToken).toEqual('token')
    expect(userWithBearerToken.currentStrategy).toEqual(currentStrategy)
  })

  it('shoulds throws `Unauthorized` if `bearerToken` is not a string', async () => {
    await expect(
      async () => await getUserWithBearerToken(undefined)
    ).rejects.toThrow(Unauthorized)
  })

  it('shoulds throws `Unauthorized` if `bearerToken` is not to the right format: `"Bearer token"`', async () => {
    await expect(
      async () => await getUserWithBearerToken('Bearer')
    ).rejects.toThrow(Unauthorized)
    await expect(async () => await getUserWithBearerToken('')).rejects.toThrow(
      Unauthorized
    )
    await expect(
      async () => await getUserWithBearerToken('Bearer token token2')
    ).rejects.toThrow(Unauthorized)
  })

  it('shoulds throws `Forbidden` if invalid `bearerToken` by `jwt.verify`', async () => {
    jwt.verify = jest.fn<any, any[]>((() => {
      throw new Error('Invalid token')
    }) as any)
    await expect(
      async () => await getUserWithBearerToken('Bearer token')
    ).rejects.toThrow(Forbidden)
  })

  it("shoulds throws `Forbidden` if the user doesn't exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    jwt.verify = jest.fn<any, any[]>((() => {
      return { id: userExample.id }
    }) as any)
    await expect(
      async () => await getUserWithBearerToken('Bearer token')
    ).rejects.toThrow(Forbidden)
  })

  it('shoulds throws `BadRequest` if the user account is not confirmed', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userExample,
      isConfirmed: false
    })
    jwt.verify = jest.fn<any, any[]>((() => {
      return { id: userExample.id, currentStrategy: 'local' }
    }) as any)
    await expect(
      async () => await getUserWithBearerToken('Bearer token')
    ).rejects.toThrow(BadRequest)
  })
})
