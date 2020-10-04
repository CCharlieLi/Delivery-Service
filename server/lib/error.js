'use strict';

const app = require('../server');
const ExtendableError = require('es6-error');
const { errorCode } = require('../constants');

/**
 * Examples:
 *   new ServiceError(code)
 *   new ServiceError(code, msg)
 *   new ServiceError(code, msg, logOptions)
 *   new ServiceError(code, logOptions)
 *   new ServiceError(code, ErrorInstance)
 *   new ServiceError(code, ErrorInstance, logOptions)
 *   new ServiceError(code, ServiceErrorInstance)
 */
module.exports = class ServiceError extends ExtendableError {
  constructor(code, msg, logOptions) {
    let statusCode;
    let extraInfo;

    if (msg instanceof ServiceError) {
      statusCode = msg.statusCode;
      code = msg.code;
      msg = msg.message;
      extraInfo = msg.extraInfo;
    } else {
      if (msg instanceof Error) {
        extraInfo = msg.extraInfo;
        msg = msg.message;
      } else if (typeof msg !== 'string') {
        logOptions = msg;
        msg = (logOptions && logOptions.message) || null;
      }

      statusCode = (errorCode[code] && errorCode[code].status) || 500;
      msg = msg || (errorCode[code] && errorCode[code].message);

      // Log error
      app.logger.error(
        {
          ...logOptions,
          targetModule: `Service Error`,
          code,
          message: (logOptions && logOptions.message) || msg || code,
        },
        (logOptions && logOptions.message) || msg || code
      );
    }

    super(msg);
    this.code = code;
    this.statusCode = statusCode;
    this.extraInfo = extraInfo;
  }
};
