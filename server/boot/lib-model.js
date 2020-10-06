'use strict';

const Graph = require('../lib/graph');
const loggerFactory = require('bunyan-logger-factory');

module.exports = (app) => {
  // logger
  app.logger = loggerFactory.init({
    logName: app.get('logName'),
    logStream: app.get('logStream'),
    logHost: app.get('syslogHost'),
    logPort: app.get('syslogPort'),
    logProto: app.get('syslogProto'),
  });

  // global graph
  app.graph = new Graph();
};
