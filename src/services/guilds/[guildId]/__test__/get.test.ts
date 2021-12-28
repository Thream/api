import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { memberExample } from '../../../../models/Member.js'
import { guildExample } from '../../../../models/Guild.js'
import { userExample } from '../../../../models/User.js'

describe('GET /guilds/[guildId]', () => {
  it('succeeds', async () => {
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      guild: guildExample,
      user: userExample
    } as any)
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.member.isOwner).toEqual(memberExample.isOwner)
    expect(responseJson.member.user.name).toEqual(user.name)
    expect(responseJson.member.user.email).toBeNull()
    expect(responseJson.guild.name).toEqual(guildExample.name)
  })

  it('fails with not found guild', async () => {
    const { accessToken } = await authenticateUserTest()
    prismaMock.member.findFirst.mockResolvedValue(null)
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(404)
    expect(responseJson.message).toEqual('Member not found')
  })

  it('fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1'
    })
    expect(response.statusCode).toEqual(401)
  })
})
