'use strict';

const Promise = require('bluebird');
const supertest = require('swagger-supertest');
const methods = ['get', 'post', 'delete', 'patch', 'put'];
const headers = {
  'content-type': 'application/json',
  accept: 'application/json',
};

exports.request = (server) => {
  const reqProxy = {};
  methods.forEach(
    (verb) =>
      (reqProxy[verb] = (url) => supertest(server)[verb](url).type(headers['content-type']).accept(headers['accept']))
  );
  return reqProxy;
};

exports.flushByModel = (Model) => {
  return Model.getConnector()
    .view('findAll', 'byType', {
      key: Model.definition.name,
      stale: 1,
    })
    .then((res) => Promise.map(res, (each) => Model.deleteById(each.id)));
};
