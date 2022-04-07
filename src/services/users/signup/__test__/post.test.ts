import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { userExample } from '../../../../models/User.js'
import { userSettingsExample } from '../../../../models/UserSettings.js'
import { emailTransporter } from '../../../../tools/email/emailTransporter.js'

const payload = {
  name: userExample.name,
  email: userExample.email,
  password: userExample.password,
  theme: userSettingsExample.theme,
  language: userSettingsExample.language
}

await tap.test('POST /users/signup', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return null
      },
      create: async () => {
        return userExample
      }
    })
    sinon.stub(prisma, 'userSetting').value({
      create: async () => {
        return userSettingsExample
      }
    })
    sinon.stub(emailTransporter, 'sendMail').value(() => {})
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 201)
    t.equal(responseJson.user.name, userExample.name)
    t.equal(responseJson.user.email, userExample.email)
  })

  await t.test('fails with invalid email', async (t) => {
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return null
      }
    })
    sinon.stub(emailTransporter, 'sendMail').value(() => {})
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload: {
        ...payload,
        email: 'incorrect-email@abc'
      }
    })
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with already taken `name` or `email`', async (t) => {
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return userExample
      }
    })
    sinon.stub(emailTransporter, 'sendMail').value(() => {})
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload
    })
    t.equal(response.statusCode, 400)
  })
})
