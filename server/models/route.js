'use strict';

const Promise = require('bluebird');
const lib = require('../lib');
const ServiceError = lib.error;
const { pathSchema } = lib.schema;
const { validSchema, subDocMutateIn, disableRemoteMethods } = lib.utils;

module.exports = (Route) => {
  // disable default endpoints
  disableRemoteMethods(Route);

  /**
   * Calculate cost of given route
   * @param {string} transactionId
   * @param {string} userId
   * @param {string} route
   */
  Route.calCost = (transactionId, userId, route) => {
    const { logger } = Route.app;
    const { Path } = Route.app.models;
    logger.info(`calculate route cost`, { transactionId, userId, route });

    // extract toens
    const towns = route.split('-');
    if (towns.length === 0 || towns.includes('')) throw new ServiceError(1101);
    // TODO route length limit check

    // reform paths
    const paths = towns.reduce((acc, cur, index) => {
      if (towns[index + 1] == null) return acc;
      return acc.concat([[cur, towns[index + 1]]]);
    }, []);

    // calculate cost
    return Promise.reduce(
      paths,
      async (acc, path) => {
        const ins = await Path.findById(path[0]);
        if (ins && ins[path[1]]) return acc + parseInt(ins[path[1]], 10);
        throw new ServiceError(1102, { transactionId, path });
      },
      0
    );
  };

  Route.remoteMethod('calCost', {
    description: 'calculate cost of given route',
    http: { path: '/:route/cost', verb: 'get' },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'route', required: true, type: 'string', http: { source: 'path' } },
    ],
  });

  Route.countRoutes = async (transactionId, userId, start, end) => {};
};
