import request from 'supertest'

import application from '../application'
import { usersLogoPath } from '../tools/configurations/constants'

describe('application', () => {
  it("returns a 404 on route that doesn't exist", async () => {
    return await request(application).post('/404routenotfound').send().expect(404)
  })

  it('returns a 200 success code for users images', async () => {
    return await request(application)
      .get(`${usersLogoPath.name}/default.png`)
      .send()
      .expect(200)
  })
})
