import request from 'supertest'

import application from '../../../../../application'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import { createInvitation } from '../../../../invitations/__test__/utils/createInvitation'

describe('GET /guilds/:guildId/invitations', () => {
  it('should get all the invitations of the guild', async () => {
    const value1 = 'awesome'
    const value2 = 'awesomevalue'
    const result = await createInvitation({ value: value1 })
    await createInvitation({
      value: value2,
      guildId: result?.guild.id
    })
    const response = await request(application)
      .get(`/guilds/${result?.guild.id as number}/invitations`)
      .set(
        'Authorization',
        `${result?.user.type as string} ${result?.user.accessToken as string}`
      )
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.rows.length).toEqual(2)
    expect(response.body.rows[0].value).toEqual(value2)
    expect(response.body.rows[1].value).toEqual(value1)
  })

  it('fails if the user is not the owner', async () => {
    const userToken = await authenticateUserTest()
    const result = await createInvitation()
    const response = await request(application)
      .get(`/guilds/${result?.guild.id as number}/invitations`)
      .set(
        'Authorization',
        `${userToken.type as string} ${userToken.accessToken}`
      )
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
