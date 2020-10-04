#!/bin/bash
set -ev

# Environment variables.
COUCHBASE_USER=${COUCHBASE_USER:-Administrator}
COUCHBASE_PASS=${COUCHBASE_PASS:-password}
BUCKET_NAME=${BUCKET_NAME:-delivery}
pushd `dirname $0`

# Start the services and wait for it.
docker-compose up -d --build

STATUS=""
until [[ ${STATUS} = "healthy" ]]; do
    STATUS=`docker inspect --format='{{.State.Health.Status}}' delivery_couchbase`
    echo ${STATUS}
    sleep 5
done

docker-compose run --rm \
    --entrypoint=/opt/couchbase/bin/couchbase-cli couchbase \
    cluster-init -c couchbase:8091 \
    --cluster-username=$COUCHBASE_USER --cluster-password=$COUCHBASE_PASS \
    --cluster-ramsize=512 --cluster-index-ramsize=256 \
    --cluster-fts-ramsize=256 \
    --services=data,index,query,fts

docker-compose run --rm --entrypoint=/opt/couchbase/bin/couchbase-cli couchbase \
  bucket-create -c couchbase:8091 -u $COUCHBASE_USER -p $COUCHBASE_PASS \
  --bucket=${BUCKET_NAME} --bucket-type=couchbase \
  --bucket-ramsize=128 --bucket-replica=0 --enable-flush=1 --wait
