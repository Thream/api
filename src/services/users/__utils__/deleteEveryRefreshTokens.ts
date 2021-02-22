import RefreshToken from '../../../models/RefreshToken'

export const deleteEveryRefreshTokens = async (
  userId: number
): Promise<void> => {
  const refreshTokens = await RefreshToken.findAll({
    where: { userId }
  })
  for (const refreshToken of refreshTokens) {
    await refreshToken.destroy()
  }
}
