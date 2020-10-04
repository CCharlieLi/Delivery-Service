'use strict';

/**
 * set the http response with Service Error
 * @returns {Function} The express middleware handler
 */

const { errorCode } = require('../constants');

module.exports = () => (err, req, res, next) => {
  if (err.name === 'ServiceError' && err.code) {
    err.statusCode = errorCode[err.code].status;
    err.message = err.message || errorCode[err.code].message;
  }
  next(err);
};
