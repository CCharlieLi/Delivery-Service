'use strict';
const logger = require('express-bunyan-logger');
const Sentry = require('@sentry/node');

module.exports = function (app) {
  Sentry.init({
    dsn: app.get('sentryDSN'),
    serverName: 'deliver-service',
    environment: app.get('sentryEnvironment'),
  });

  app.middleware(
    'initial:after',
    logger({
      logger: app.logger,
      immediate: true,
      genReqId: function (req) {
        return req.get('x-transaction-id');
      },
      excludes: ['res', 'res-headers'],
    })
  );

  app.middleware(
    'routes:before',
    logger({
      logger: app.logger,
      immediate: false,
      genReqId: function (req) {
        return req.get('x-transaction-id');
      },
    })
  );

  app.middleware('routes:before', Sentry.Handlers.requestHandler());

  app.middleware('final:before', (err, req, res, next) => {
    const transactionId = req.get('x-transaction-id');
    const userKey = app.get('userIdHeader');
    const userId = req.get(userKey);
    Sentry.configureScope((scope) => {
      scope.setExtras(err);
      scope.setTag('transactionId', transactionId);
      if (userId) {
        scope.setUser({ id: userId });
      }
    });
    const options = {
      shouldHandleError: () => true, // log all errors
    };
    Sentry.Handlers.errorHandler(options)(err, req, res, next);
  });

  app.middleware('final:before', (err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      delete err.stack;
    }
    logger.errorLogger({
      logger: app.logger,
      immediate: false,
      genReqId: function (req) {
        return req.get('x-transaction-id');
      },
    })(err, req, res, next);
  });
};
