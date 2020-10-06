'use strict';

require('should');
const app = require('../server/server');
const { request, flushByModel } = require('./test-helper');
let Path;
let Town;

describe('Route API', () => {
  context('calculate route cost', () => {
    before(async () => {
      await app.boot();
      Path = app.models.Path;
      Town = app.models.Town;
    });
    beforeEach('init towns', async () => {
      await Town.create({ id: 'town:A', name: 'A town' });
      await Town.create({ id: 'town:B', name: 'B town' });
      await Town.create({ id: 'town:C', name: 'C town' });
      await Town.create({ id: 'town:D', name: 'D town' });
      await Path.create({ id: 'A', B: '1' });
      await Path.create({ id: 'B', C: '2' });
      await Path.create({ id: 'C', D: '3' });
      await Path.create({ id: 'D', A: '4' });
    });
    afterEach('clean up', async () => {
      await flushByModel(Path);
      await flushByModel(Town);
    });

    it('should return 400 with invalid route - 1', async () => {
      const { body } = await request(app)
        .get('/api/routes/A--A/cost')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(400);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1101);
    });

    it('should return 400 with invalid route - 2', async () => {
      const { body } = await request(app)
        .get('/api/routes/-/cost')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(400);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1101);
    });

    it('should return 200 when cal route cost successfully', async () => {
      const { body } = await request(app)
        .get('/api/routes/A-B-C-D-A/cost')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      body.data.should.be.equal(10);

      const res = await request(app)
        .get('/api/routes/B-C-D-A/cost')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      res.body.data.should.be.equal(9);
    });

    it('should return 404 when path not found', async () => {
      const { body } = await request(app)
        .get('/api/routes/A-B-D/cost')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(404);
      body.error.name.should.be.equal('ServiceError');
      body.error.code.should.be.equal(1102);
      body.error.message.should.be.equal('No​ ​Such​ ​Route');
    });
  });

  context('refresh graph', () => {
    before(async () => {
      await app.boot();
      Path = app.models.Path;
      Town = app.models.Town;
    });
    beforeEach('init towns', async () => {
      await Town.create({ id: 'town:A', name: 'A town' });
      await Town.create({ id: 'town:B', name: 'B town' });
      await Town.create({ id: 'town:C', name: 'C town' });
      await Town.create({ id: 'town:D', name: 'D town' });
      await Path.create({ id: 'A', B: '1' });
      await Path.create({ id: 'B', C: '2' });
      await Path.create({ id: 'C', D: '3' });
      await Path.create({ id: 'D', A: '4' });
    });
    afterEach('clean up', async () => {
      await flushByModel(Path);
      await flushByModel(Town);
    });

    it('should return 204 when refresh graph', async () => {
      await request(app)
        .post('/api/routes/refresh')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(204);
      app.graph.nodes.should.deepEqual({ A: { B: '1' }, B: { C: '2' }, C: { D: '3' }, D: { A: '4' } });
    });
  });

  context('find routes', () => {
    beforeEach('init towns', async () => {
      await app.boot();
      app.graph.refresh({
        A: { B: 1, C: 4, D: 10 },
        B: { E: 3 },
        C: { D: 4, F: 2 },
        D: { E: 1 },
        E: { B: 3, A: 2 },
        F: { D: 1 },
      });
    });

    it('should return 200 with routes', async () => {
      const { body } = await request(app)
        .get('/api/routes?start=E&end=D&stopLimit=4')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      body.data.length.should.be.equal(4);
      body.data[0].cost.should.be.equal(9);
    });

    it('should return 200 with routes', async () => {
      const { body } = await request(app)
        .get('/api/routes?start=E&end=E')
        .set('x-transaction-id', 'test-transactionId')
        .set('x-user-id', 'test-user')
        .expect(200);
      body.data.length.should.be.equal(5);
      body.data[0].cost.should.be.equal(6);
    });
  });
});
