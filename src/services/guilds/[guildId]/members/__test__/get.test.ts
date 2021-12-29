import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { memberExample } from '../../../../../models/Member.js'
import { userExample } from '../../../../../models/User.js'

describe('GET /guilds/[guildId]/members', () => {
  it('succeeds', async () => {
    prismaMock.member.findFirst.mockResolvedValue(memberExample)
    prismaMock.member.findMany.mockResolvedValue([
      { ...memberExample, user: userExample }
    ] as any)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: `/guilds/${memberExample.guildId}/members`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.length).toEqual(1)
    expect(responseJson[0].id).toEqual(memberExample.id)
    expect(responseJson[0].isOwner).toEqual(memberExample.isOwner)
    expect(responseJson[0].user.id).toEqual(userExample.id)
    expect(responseJson[0].user.name).toEqual(userExample.name)
    expect(responseJson[0].user.email).toEqual(null)
  })

  it('fails with not found member', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/guilds/1/members',
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
      url: '/guilds/1/members'
    })
    expect(response.statusCode).toEqual(401)
  })
})
