const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');

const { User } = require('../../models/user');

let server;
const user = new User({ phoneNumber: '1234123412', name: '123' });
const token = user.generateAuthToken();

const execRequest = (server, token, payload) => {
  return request(server)
    .get('/api/uploadurlrequest/multiple')
    .set('x-auth-token', token)
    .set('deviceId', '123')
    .send(payload);
}

describe('/api/uploadurlrequest', () => {

  beforeEach(async () => {
    server = require('../../index');

  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /multiple', () => {
    let payload;
    beforeEach(async () => {
      payload = {
        count: 1
      }
    })
    it('should upload successfully', async () => {
      const res = await execRequest(server, token, payload);

      expect(res.status).toBe(200);
    });
  });
});