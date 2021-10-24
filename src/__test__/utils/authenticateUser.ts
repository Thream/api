import request from 'supertest'

import application from '../../application'
import User from '../../models/User'

interface AuthenticateUserOptions {
  name?: string
  email?: string
  password?: string
  shouldBeConfirmed?: boolean
  alreadySignedUp?: boolean
}

export async function authenticateUserTest (
  options: AuthenticateUserOptions = {}
): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: string
    type: 'Bearer'
    userId: number
  }> {
  const {
    name = 'John',
    email = 'contact@test.com',
    shouldBeConfirmed = true,
    password = 'test',
    alreadySignedUp = false
  } = options

  if (!alreadySignedUp) {
    const { body: signupBody } = await request(application)
      .post('/users/signup')
      .send({ name, email, password })
      .expect(201)
    let signinResponse: any = { body: {} }
    if (shouldBeConfirmed) {
      const user = await User.findOne({ where: { id: signupBody.user.id } })
      await request(application)
        .get(`/users/confirmEmail?tempToken=${user?.tempToken as string}`)
        .send()
        .expect(200)
      signinResponse = await request(application)
        .post('/users/signin')
        .send({ email, password })
        .expect(200)
    }

    return { ...signinResponse.body, userId: signupBody.user.id }
  }
  const signinResponse = await request(application)
    .post('/users/signin')
    .send({ email, password })
    .expect(200)
  const user = await User.findOne({ where: { email } })
  return { ...signinResponse.body, userId: user?.id }
}
