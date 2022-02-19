import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { memberExample } from '../../../../models/Member.js'
import { guildExample } from '../../../../models/Guild.js'

describe('DELETE /guilds/[guildId]', () => {
  it('succeeds and delete the guild', async () => {
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      isOwner: true
    })
    prismaMock.guild.delete.mockResolvedValue(guildExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.name).toEqual(guildExample.name)
    expect(responseJson.description).toEqual(guildExample.description)
  })

  it("fails if the guild doesn't exist", async () => {
    prismaMock.member.findFirst.mockResolvedValue(null)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(404)
  })

  it('fails if the user is not the owner', async () => {
    prismaMock.member.findFirst.mockResolvedValue({
      ...memberExample,
      isOwner: false
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(403)
    expect(responseJson.message).toEqual('You should be an owner of the guild')
  })
})
