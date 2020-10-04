'use strict';

require('should');
const { request } = require('./test-helper');
const app = require('../server/server');

describe('Healthy API', () => {
  it('health api should return status', async () => {
    await app.boot();
    const { body } = await request(app).get('/health').set('Accept', 'application/json').expect(200);
    body.started.should.be.ok();
    body.uptime.should.be.ok();
    body.version.should.be.ok();
  });
});
