import request from 'supertest'

import app from '../../../../../app'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import { createInvitation } from '../../../../invitations/__test__/utils/createInvitation'

describe('GET /guilds/:guildId/invitations', () => {
  it('should get all the invitations of the guild', async () => {
    const value1 = 'awesome'
    const value2 = 'awesomevalue'
    const result1 = await createInvitation({ value: value1 })
    await createInvitation({
      value: value2,
      guildId: result1?.guild.id
    })
    const response = await request(app)
      .get(`/guilds/${result1?.guild.id as number}/invitations`)
      .set(
        'Authorization',
        `${result1?.user.type as string} ${result1?.user.accessToken as string}`
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
    const response = await request(app)
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
