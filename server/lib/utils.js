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
 * Query data from Couchbase by QueryView
 * @param {string} transactionId
 * @param {object} Model
 * @param {array} params
 */
exports.queryView = (transactionId, Model, params) => {
  return Model.getConnector()
    .view(...params)
    .catch((err) => Promise.reject(new ServiceError(1002, err, { transactionId })));
};

/**
 * Get documents by ids (Batch query)
 * @param {object} Model
 * @param {array} ids
 * @param {number} batch
 */
exports.findByBatch = async (Model, ids, batch = 2000) => {
  let tmp;
  let result = [];
  for (let i = 0; i < ids.length / batch; i++) {
    tmp = ids.slice(i * batch, batch + i * batch);
    if (tmp.length === 0) break;
    result = result.concat(await Model.findByIds(tmp));
    if (tmp.length < batch) break;
  }
  return result;
};

/**
 * Pagination for array data
 * @param {array} data
 * @param {number} offset
 * @param {number} limit
 */
exports.pagination = (data, offset = 0, limit) => {
  limit = limit || data.length;
  return data.slice(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10));
};

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
