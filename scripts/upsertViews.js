/* eslint no-console: ["error", { allow: ["log"] }] */
'use strict';

module.exports = (cluster, bucket, docs) => {
  const client = cluster.openBucket(bucket, (err) => {
    if (err) {
      client.disconnect();
      console.log(err);
      process.exit(1);
    } else {
      docs.forEach((each) => {
        if (each.buckets.indexOf(bucket) > -1) {
          client.manager().upsertDesignDocument(each.docName, each.doc, (err) => {
            if (err) {
              console.log(err);
              process.exit(1);
            }
          });
        }
      });
      client.disconnect();
    }
  });
};
