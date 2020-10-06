'use strict';

require('should');
const app = require('../server/server');
const { request, flushByModel } = require('./test-helper');
let Path;
let Town;

describe('Path API', () => {
  context('create path', () => {
    before(async () => {
      await app.boot();
      Path = app.models.Path;
      Town = app.models.Town;
    });
    beforeEach('init towns', async () => {
      await Town.create({ id: 'town:A', name: 'A town' });
      await Town.create({ id: 'town:B', name: 'B town' });
      await Town.create({ id: 'town:C', name: 'C town' });
    });
    afterEach('clean up', async () => {
      await flushByModel(Path);
      await flushByModel(Town);
    });

    it('should return 400 with invalid data - 1', async () => {
      await request(app)
        .post('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { start: 'ABBB', end: 'B', cost: 12 } })
        .expect(400);
    });

    it('should return 400 with invalid data - 2', async () => {
      await request(app)
        .post('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { start: 'A', end: 'B', cost: 0 } })
        .expect(400);
    });

    it('should return 404 when town not found', async () => {
      const { body } = await request(app)
        .post('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { start: 'AA', end: 'B', cost: 10 } })
        .expect(404);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1100);
    });

    it('should return 204 when create path successfully', async () => {
      await request(app)
        .post('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { start: 'A', end: 'B', cost: 12 } })
        .expect(204);
      const path = await Path.findById('A');
      path.id.should.be.equal('A');
      path.B.should.be.equal(12);

      await request(app)
        .post('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .send({ data: { start: 'A', end: 'C', cost: 10 } })
        .expect(204);
      const path1 = await Path.findById('A');
      path1.id.should.be.equal('A');
      path1.B.should.be.equal(12);
      path1.C.should.be.equal(10);
    });
  });

  context('get all paths', () => {
    before(async () => {
      await app.boot();
      Path = app.models.Path;
      Town = app.models.Town;
    });
    beforeEach('init towns', async () => {
      await Town.create({ id: 'town:A', name: 'A town' });
      await Town.create({ id: 'town:B', name: 'B town' });
      await Town.create({ id: 'town:C', name: 'C town' });
      await Path.create({ id: 'A', B: 3, C: 4 });
      await Path.create({ id: 'B', C: 14 });
      await Path.create({ id: 'C', A: 8, B: 1 });
    });
    afterEach('clean up', async () => {
      await flushByModel(Path);
      await flushByModel(Town);
    });

    it('should get 200 with all paths', async () => {
      const { body } = await request(app)
        .get('/api/paths')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      body.meta.total.should.be.equal(3);
      body.data.should.deepEqual([{ A: { B: 3, C: 4 } }, { B: { C: 14 } }, { C: { A: 8, B: 1 } }]);
    });

    it('should get 200 with paths by pagination', async () => {
      const { body } = await request(app)
        .get('/api/paths?page[offset]=1&page[limit]=1')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      body.meta.total.should.be.equal(3);
      body.data.should.deepEqual([{ B: { C: 14 } }]);
    });
  });
});
