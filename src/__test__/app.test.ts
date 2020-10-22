import request from 'supertest'

import app from '../app'

describe('app', () => {
  it("returns a 404 on route that doesn't exist", async () => {
    return await request(app)
      .post('/404routenotfound')
      .send()
      .expect(404)
  })

  it('returns a 200 success code for public users images', async () => {
    return await request(app)
      .get('/images/users/default.png')
      .send()
      .expect(200)
  })
})
