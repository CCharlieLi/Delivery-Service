#! /usr/bin/env node
'use strict';

const Couchbase = require('couchbase');
const upsertViews = require('./upsertViews');
const env = require('../server/config.local');
const bucket = env.bucketName || 'delivery';
const dbUser = env.cbUsername || 'Administrator';
const dbPass = env.cbPassword || 'password';
const cluster = new Couchbase.Cluster(env.cbHost || 'http://127.0.0.1:8091');
cluster.authenticate(dbUser, dbPass);

const designDocs = [
  {
    buckets: [bucket],
    docName: 'findAll',
    doc: {
      views: {
        byType: {
          map: `function(doc, meta) {
            if (doc._type) {
                emit(doc._type, null);
            }
          }`,
        },
        byTypeAndCreatedAt: {
          map: `function(doc, meta) {
            if (doc._type && doc.createdAt) {
              emit([doc._type].concat(dateToArray(doc.createdAt)), { username: doc.username });
            }
          }`,
        },
      },
    },
  },
];

upsertViews(cluster, bucket, designDocs);
