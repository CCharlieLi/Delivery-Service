/* eslint no-console: ["error", { allow: ["log"] }] */
'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = (module.exports = loopback());

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

app.boot = async () => {
  try {
    await boot(app, __dirname);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('failed to start the server', err);
    // process.exit(1);
  }
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.boot().then(() => app.start());
}
