import {
  getUserWithBearerToken,
  errorsMessages,
  authenticateUser
} from '../authenticateUser'
import { BadRequestError } from '../../errors/BadRequestError'
import { UnauthorizedError } from '../../errors/UnauthorizedError'
import { generateAccessToken } from '../../configurations/jwtToken'
import { ForbiddenError } from '../../errors/ForbiddenError'
import User from '../../../models/User'

const mockReq = (accessToken: string): any => {
  const req: any = {}
  req.user = null
  req.get = jest.fn().mockReturnValue(`Bearer ${accessToken}`)
  return req
}

describe('/tools/middlewares/authenticateUser', () => {
  it('succeeds with valid token', async () => {
    const user = await User.create({ name: 'user', isConfirmed: true })
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    const result = await getUserWithBearerToken(`Bearer ${accessToken}`)
    expect(result.current.name).toEqual(user.name)
    expect(result.currentStrategy).toEqual('local')
    expect(result.accessToken).toEqual(accessToken)
  })

  it('succeeds, get the Authorization header and set the correct value to the req.user', async () => {
    const user = await User.create({ name: 'user', isConfirmed: true })
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    const mockedReq = mockReq(accessToken)
    const mockedNext = jest.fn()
    await authenticateUser(mockedReq, {} as any, mockedNext)
    expect(mockedReq.get).toHaveBeenCalledWith('Authorization')
    expect(mockedReq.user).not.toBeNull()
    expect(mockedReq.user.current.name).toEqual(user.name)
    expect(mockedNext).toHaveBeenCalled()
  })

  it('fails with invalid bearer token', async () => {
    await expect(getUserWithBearerToken()).rejects.toThrowError(
      UnauthorizedError
    )
  })

  it('fails with invalid bearer token format', async () => {
    await expect(getUserWithBearerToken('Bearertoken')).rejects.toThrowError(
      UnauthorizedError
    )
  })

  it('fails with invalid token', async () => {
    await expect(getUserWithBearerToken('Bearer token')).rejects.toThrowError(
      ForbiddenError
    )
  })

  it("fails if the user with that jwt token doesn't exist", async () => {
    const accessToken = generateAccessToken({ currentStrategy: 'local', id: 2 })
    await expect(
      getUserWithBearerToken(`Bearer ${accessToken}`)
    ).rejects.toThrowError(ForbiddenError)
  })

  it('fails if the user is not confirmed and he is using local strategy', async () => {
    const user = await User.create({ name: 'user', isConfirmed: false })
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    await expect(
      getUserWithBearerToken(`Bearer ${accessToken}`)
    ).rejects.toThrowError(new BadRequestError(errorsMessages.invalidAccount))
  })
})
