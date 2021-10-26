import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { guildExample } from '../../../../models/Guild.js'

describe('GET /guilds/public', () => {
  it('succeeds', async () => {
    prismaMock.guild.findMany.mockResolvedValue([guildExample])
    prismaMock.member.count.mockResolvedValue(2)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/public',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.length).toEqual(1)
    expect(responseJson[0].name).toEqual(guildExample.name)
    expect(responseJson[0].membersCount).toEqual(2)
  })
})
