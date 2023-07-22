import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import prisma from '#src/tools/database/prisma.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'

await test('PUT /users/current', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds with valid accessToken and valid name', async () => {
    const newName = 'John Doe'
    const { accessToken, user, userStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'user').value({
      ...userStubValue,
      findFirst: async () => {
        return null
      },
      update: async () => {
        return {
          ...user,
          name: newName
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.user.name, newName)
  })

  await t.test('succeeds and only update the status', async () => {
    const newStatus = '👀 Working on secret projects...'
    const { accessToken, user, userStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'user').value({
      ...userStubValue,
      findFirst: async () => {
        return null
      },
      update: async () => {
        return {
          ...user,
          status: newStatus
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        status: newStatus
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.user.name, user.name)
    assert.strictEqual(responseJson.user.status, newStatus)
  })

  await t.test('fails with name already used', async () => {
    const newName = 'John Doe'
    const { accessToken, user, userStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'user').value({
      ...userStubValue,
      findFirst: async () => {
        return user
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('fails with invalid website url', async () => {
    const newWebsite = 'invalid website url'
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        website: newWebsite
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('succeeds with valid website url', async () => {
    const newWebsite = 'https://somerandomwebsite.com'
    const { accessToken, user, userStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'user').value({
      ...userStubValue,
      findFirst: async () => {
        return null
      },
      update: async () => {
        return {
          ...user,
          website: newWebsite
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        website: newWebsite
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.user.name, user.name)
    assert.strictEqual(responseJson.user.website, newWebsite)
  })
})
