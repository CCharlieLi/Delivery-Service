'use strict';

const lib = require('../lib');
const ServiceError = lib.error;
const { pathSchema } = lib.schema;
const { validSchema, subDocMutateIn, disableRemoteMethods } = lib.utils;

module.exports = (Path) => {
  // disable default endpoints
  disableRemoteMethods(Path);

  /**
   * Create path for towns
   * @param {*} transactionId
   * @param {*} userId
   * @param {*} data
   */
  Path.createPath = async (transactionId, userId, data) => {
    const { logger } = Path.app;
    const { Town } = Path.app.models;
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

    return;
  };

  Path.remoteMethod('createPath', {
    description: 'create path',
    http: { path: '/', verb: 'post', status: 204 },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'data', required: true, type: 'object', http: { source: 'form' } },
    ],
  });
};
