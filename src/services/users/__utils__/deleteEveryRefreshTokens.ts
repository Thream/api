import RefreshToken from '../../../models/RefreshToken'
import { UnauthorizedError } from '../../../utils/errors/UnauthorizedError'

export const deleteEveryRefreshTokens = async (
  userId: number
): Promise<void> => {
  const refreshTokens = await RefreshToken.findAll({
    where: { userId }
  })
  if (refreshTokens == null) {
    throw new UnauthorizedError()
  }
  for (const refreshToken of refreshTokens) {
    await refreshToken.destroy()
  }
}
