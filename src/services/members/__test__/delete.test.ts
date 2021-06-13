import request from 'supertest'
import application from '../../../application'
import Member from '../../../models/Member'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import { createGuild } from '../../guilds/__test__/utils/createGuild'

describe('DELETE /members', () => {
  it('succeeds and delete the member', async () => {
    const result = await createGuild({
      guild: { description: 'testing', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const userToken = await authenticateUserTest()
    const memberToDelete = await Member.create({
      userId: userToken.userId,
      guildId: result.guild.id,
      lastVisitedChannelId: 1
    })
    const response = await request(application)
      .delete('/members')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.deletedMemberId).toEqual(memberToDelete.id)
  })
})
