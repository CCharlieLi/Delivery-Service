'use strict';

const R = require('ramda');
const lib = require('../lib');
const { pathSchema } = lib.schema;
const { queryView, pagination, findByBatch, validSchema, subDocMutateIn, disableRemoteMethods } = lib.utils;

module.exports = (Path) => {
  // disable default endpoints
  disableRemoteMethods(Path);

  /**
   * Upsert path for towns
   * @param {*} transactionId
   * @param {*} userId
   * @param {*} data
   */
  Path.upsertPath = async (transactionId, userId, data) => {
    const { logger } = Path.app;
    const { Town, Route } = Path.app.models;
    logger.info(`create path`, { transactionId, userId, data });

    // schema validate
    await validSchema(pathSchema, data);

    // check town existence
    await Town._getTownById(transactionId, data.start);
    await Town._getTownById(transactionId, data.end);

    // create document if start point not exist
    if (!(await Path.exists(data.start))) {
      await Path.create({ id: data.start });
    }

    // upsert path for start point
    await subDocMutateIn({
      transactionId,
      Model: Path,
      id: data.start,
      operations: [['upsert', `${data.end}`, data.cost, true]],
    });

    // upsert path in global graph
    await Route.addToRoute(data.start, data.end, data.cost);

    return;
  };

  Path.remoteMethod('upsertPath', {
    description: 'upsert path',
    http: { path: '/', verb: 'post', status: 204 },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'data', required: true, type: 'object', http: { source: 'form' } },
    ],
  });

  /**
   * Get paths
   * @param {string} transactionId
   * @param {string} userId
   * @param {object} page
   */
  Path.getPaths = async (transactionId, userId, page) => {
    const { logger } = Path.app;
    logger.info(`get paths`, { transactionId, userId });

    const limit = page && page.limit;
    const offset = page && page.offset;

    // Query paths from DB
    const queryRes = await queryView(transactionId, Path, ['findAll', 'byType', { key: 'Path', stale: 1 }]);
    const data = await findByBatch(
      Path,
      pagination(queryRes, offset, limit).map((path) => path.id)
    ).then((paths) =>
      paths.map((each) => ({
        [each.id]: R.dissoc('id', R.dissoc('createdAt', R.dissoc('updatedAt', each.toJSON()))),
      }))
    );

    return {
      meta: { total: queryRes.length },
      data,
    };
  };

  Path.remoteMethod('getPaths', {
    description: 'get paths',
    http: { path: '/', verb: 'get' },
    returns: { root: true },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'page', type: 'object', http: { source: 'query' } },
    ],
  });
};
