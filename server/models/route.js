'use strict';

const R = require('ramda');
const Promise = require('bluebird');
const lib = require('../lib');
const ServiceError = lib.error;
const { disableRemoteMethods } = lib.utils;

module.exports = (Route) => {
  // disable default endpoints
  disableRemoteMethods(Route);

  Route.addToRoute = async (start, end, cost) => {
    const { graph } = Route.app;
    graph.set(start, end, cost);
  };

  Route.removeFromRoute = async (start, end) => {
    const { graph } = Route.app;
    graph.remove(start, end);
  };

  /**
   * Refresh graph with paths from DB
   * @param {string} transactionId
   * @param {string} userId
   */
  Route.refreshGraph = async (transactionId, userId) => {
    const { logger, graph } = Route.app;
    const { Path } = Route.app.models;
    logger.info(`refresh graph`, { transactionId, userId });

    const res = await Path.getPaths(transactionId, userId);
    const paths = R.mergeAll(res.data);
    logger.info(`refresh graph with data`, { transactionId, paths });

    graph.refresh(paths);
    return;
  };

  Route.remoteMethod('refreshGraph', {
    description: 'calculate cost of given route',
    http: { path: '/refresh', verb: 'post', status: 204 },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
    ],
  });

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

  Route.findRoutes = async (
    transactionId,
    userId,
    start,
    end,
    costLimit = Infinity,
    routeLimit = Infinity,
    stopLimit = Infinity,
    pathReuseLimit = 1
  ) => {
    const { logger, graph } = Route.app;
    logger.info(`find routes for given start point and end point`, { transactionId, userId, start, end });

    return graph.findRoutes(start, end, { costLimit, routeLimit, stopLimit, pathReuseLimit });
  };

  Route.remoteMethod('findRoutes', {
    description: 'find routes',
    http: { path: '/', verb: 'get' },
    returns: { arg: 'data', type: 'object' },
    accepts: [
      { arg: 'transactionId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-transaction-id'] },
      { arg: 'userId', required: true, type: 'string', http: (ctx) => ctx.req.headers['x-user-id'] },
      { arg: 'start', required: true, type: 'string', http: { source: 'query' } },
      { arg: 'end', required: true, type: 'string', http: { source: 'query' } },
      { arg: 'costLimit', type: 'number', http: { source: 'query' } },
      { arg: 'routeLimit', type: 'number', http: { source: 'query' } },
      { arg: 'stopLimit', type: 'number', http: { source: 'query' } },
      { arg: 'pathReuseLimit', type: 'number', http: { source: 'query' } },
    ],
  });
};
