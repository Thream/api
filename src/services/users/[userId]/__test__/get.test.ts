import { application } from '../../../../application.js'
import { userExample } from '../../../../models/User.js'
import { userSettingsExample } from '../../../../models/UserSettings.js'
import { prismaMock } from '../../../../__test__/setup.js'

describe('GET /users/[userId]', () => {
  it('succeeds', async () => {
    prismaMock.guild.findMany.mockResolvedValue([])
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'GET',
      url: `/users/${userExample.id}`
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.user.id).toEqual(userExample.id)
    expect(responseJson.user.name).toEqual(userExample.name)
  })
})
