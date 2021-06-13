import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import OAuth from '../../../../models/OAuth'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import { errorsMessages } from '../delete'
import { GOOGLE_PROVIDER, googleStrategy } from '../google'

describe('DELETE /users/oauth2/:provider', () => {
  it('succeeds with valid provider', async () => {
    const userToken = await authenticateUserTest()
    const oauth = await OAuth.create({
      provider: 'google',
      providerId: 'randomid',
      userId: userToken.userId
    })
    await request(application)
      .delete(`/users/oauth2/${oauth.provider}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
  })

  it('fails with invalid provider', async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .delete('/users/oauth2/google')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.provider.notUsed])
    )
  })

  it('fails with the only way to authenticate', async () => {
    const userToken = await googleStrategy.callbackSignin({
      id: 'randomproviderid',
      name: 'john'
    })
    const response = await request(application)
      .delete(`/users/oauth2/${GOOGLE_PROVIDER}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.provider.onlyWayToAuthenticate])
    )
  })
})
