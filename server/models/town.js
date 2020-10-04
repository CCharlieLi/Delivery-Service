'use strict';

const lib = require('../lib');
const ServiceError = lib.error;
const { townSchema } = lib.schema;
const { validSchema, disableRemoteMethods } = lib.utils;

module.exports = (Town) => {
  // disable default endpoints
  disableRemoteMethods(Town);

  /**
   * Get town info by id
   * @param {*} transactionId
   * @param {*} code town id
   */
  Town._getTownById = async (transactionId, code) => {
    const town = await Town.findById(`town:${code}`);
    if (town) return town;
    throw new ServiceError(1100, { transactionId, code });
  };

  /**
   * Create town
   * @param {string} transactionId
   * @param {object} data
   */
  Town.createTown = async (transactionId, userId, data) => {
    const { logger } = Town.app;
    logger.info(`create town`, { transactionId, userId, data });

    // schema validate
    await validSchema(townSchema, data);
    data.id = `town:${data.id}`;

    return Town.create(data).catch((err) => {
      // Couchbase error: The key already exists in the server
      if (err.code === 12) throw new ServiceError(1003);
      throw err;
    });
  };

  Town.remoteMethod('createTown', {
    description: 'create town',
    http: { path: '/', verb: 'post' },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'data', required: true, type: 'object', http: { source: 'form' } },
    ],
  });

  // TODO update town API
  // TODO delete town API
  // TODO get town by Id
  // TODO get town list
};
