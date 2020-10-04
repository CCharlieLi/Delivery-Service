'use strict';

require('should');
const app = require('../server/server');
const { request, flushByModel } = require('./test-helper');
let Town;

describe('Town API', () => {
  context('create town', () => {
    before(async () => {
      await app.boot();
      Town = app.models.Town;
    });
    afterEach('clean up', async () => {
      await flushByModel(Town);
    });

    it('should return 404 when create town with invalid data - 1', async () => {
      const { body } = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: {} })
        .expect(400);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1001);
    });

    it('should return 404 when create town with invalid data - 2', async () => {
      const { body } = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { id: 'ABCD', name: 'ABCD' } })
        .expect(400);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1001);
    });

    it('should return 404 when create town with invalid data - 3', async () => {
      const { body } = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { id: 'A', name: 'A' } })
        .expect(400);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1001);
    });

    it('should return 200 when create town with valid data', async () => {
      const { body } = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { id: 'A', name: 'A Town' } })
        .expect(200);
      body.data.id.should.be.equal('town:A');
      body.data.name.should.be.equal('A Town');
      body.data.createdAt.should.be.ok();
      body.data.updatedAt.should.be.ok();
    });

    it('should return 409 when provide duplicated id', async () => {
      const { body } = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { id: 'A', name: 'A Town' } })
        .expect(200);
      body.data.id.should.be.equal('town:A');
      body.data.name.should.be.equal('A Town');
      body.data.createdAt.should.be.ok();
      body.data.updatedAt.should.be.ok();

      const res = await request(app)
        .post('/api/towns')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { id: 'A', name: 'AB Town' } })
        .expect(409);
      res.body.error.code.should.be.equal(1003);
      res.body.error.message.should.be.equal('Key already exists');
    });
  });
});
