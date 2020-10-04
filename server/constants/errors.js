'use strict';

module.exports = {
  // General errors
  1000: {
    status: 500,
    message: 'database error',
  },
  1001: {
    status: 400,
    message: 'Bad schema',
  },
  1002: {
    status: 500,
    message: 'Query view failed',
  },
  1003: {
    status: 409,
    message: 'Key already exists',
  },

  // Models
  1100: {
    status: 404,
    message: 'Town not found',
  },
  1101: {
    status: 400,
    message: 'Invalid route',
  },
  1102: {
    status: 404,
    message: 'No​ ​Such​ ​Route',
  },
};
