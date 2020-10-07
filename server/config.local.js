'use strict';

const env = require('env-var');

module.exports = {
  // Server
  rootCaFile: env.get('ROOT_CA_FILE').asString(),
  userIdHeader: env.get('USER_ID_HEADER').default('x-user-id').asString(),

  // Sentry
  sentryDSN: env.get('SENTRY_DSN').default('').asString(),
  sentryEnvironment: env.get('SENTRY_ENVIRONMENT').default('dev').asString(),

  // Log
  logName: env.get('LOG_NAME').default('delivery').asString(),
  logStream: env.get('LOG_STREAM').default('file').asString(),
  syslogHost: env.get('SYSLOG_HOST').asString(),
  syslogPort: env.get('SYSLOG_PORT').asInt(),
  syslogProto: env.get('SYSLOG_PROTO').asString(),

  // Couchbase
  cbHost: env.get('CB_HOSTS').default('http://localhost:8091').asString(),
  cbUsername: env.get('CB_USER').default('Administrator').asString(),
  cbPassword: env.get('CB_PASS').default('password').asString(),
  bucketName: env.get('CB_BUCKET_NAME').default('delivery').asString(),
  bucketTimeout: env.get('CB_TIMEOUT').default('15000').asInt(),
};
