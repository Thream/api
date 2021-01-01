import request from 'supertest'

import app from '../app'
import { usersLogoPath } from '../tools/config/constants'

describe('app', () => {
  it("returns a 404 on route that doesn't exist", async () => {
    return await request(app).post('/404routenotfound').send().expect(404)
  })

  it('returns a 200 success code for users images', async () => {
    return await request(app)
      .get(`${usersLogoPath.name}/default.png`)
      .send()
      .expect(200)
  })
})
