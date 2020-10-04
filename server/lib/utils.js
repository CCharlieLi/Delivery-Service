'use strict';

const Promise = require('bluebird');
const ServiceError = require('./error');

/**
 * Joi schema validator helper
 * @param {*} schema Joi schema
 * @param {*} data
 * @param {*} opts
 */
exports.validSchema = async (schema, data, opts = {}) =>
  schema.validateAsync(data, opts).catch((err) => {
    throw new ServiceError(1001, err);
  });

/**
 * Disable loopback default endpoints
 * @param {object} model
 * @param {array} allowedMethods
 */
exports.disableRemoteMethods = function (model, allowedMethods = []) {
  model.sharedClass.methods().forEach((method) => {
    if (allowedMethods.indexOf(method.name) < 0) {
      if (method.isStatic) {
        model.disableRemoteMethodByName(method.name);
      } else {
        model.disableRemoteMethodByName('prototype.' + method.name);
      }
    }
  });
};

/**
 * Couchbase sub doc mutateIn batch operation for Node.js SDK 2.5-2.6
 * https://docs.couchbase.com/nodejs-sdk/2.6/document-operations.html#operating-with-sub-documents
 * https://docs.couchbase.com/sdk-api/couchbase-node-client-2.5.1/Bucket.html#mutateIn__anchor
 * @param {string} transactionId
 * @param {object} Model Loopback model
 * @param {string} id document id
 * @param {array} operations [ [$operation, $path, $value, $options], [$operation, $path, $value, $options] ]
 */
exports.subDocMutateIn = async ({ transactionId, Model, id, operations = [] }) => {
  try {
    const bucket = Model.getConnector().connect();
    let builderP = bucket.call('mutateIn', id);
    for (let operation of operations) {
      builderP = builderP.call(...operation);
    }
    const builder = await builderP;
    const executeP = Promise.promisify(builder.execute);
    await executeP.call(builder);
  } catch (err) {
    throw new ServiceError(1000, err, { transactionId, model: Model.name, id, operations });
  }
};
