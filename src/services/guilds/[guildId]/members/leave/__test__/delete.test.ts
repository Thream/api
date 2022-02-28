import { application } from '../../../../../../application.js'
import { authenticateUserTest } from '../../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../../__test__/setup.js'
import { guildExample } from '../../../../../../models/Guild.js'
import { memberExample } from '../../../../../../models/Member.js'

describe('DELETE /guilds/[guildId]/members/leave', () => {
  it('succeeds', async () => {
    const member = {
      ...memberExample,
      isOwner: false
    }
    prismaMock.member.findFirst.mockResolvedValue(member)
    prismaMock.member.delete.mockResolvedValue(member)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.id).toEqual(member.id)
    expect(responseJson.isOwner).toEqual(member.isOwner)
    expect(responseJson.userId).toEqual(member.userId)
  })

  it('fails if the member is not found', async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the member is owner', async () => {
    const member = {
      ...memberExample,
      isOwner: true
    }
    prismaMock.member.findFirst.mockResolvedValue(member)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
