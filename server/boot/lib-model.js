'use strict';

const loggerFactory = require('bunyan-logger-factory');

module.exports = (app) => {
  app.logger = loggerFactory.init({
    logName: app.get('logName'),
    logStream: app.get('logStream'),
    logHost: app.get('syslogHost'),
    logPort: app.get('syslogPort'),
    logProto: app.get('syslogProto'),
  });
};
