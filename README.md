# Delivery Service


## Dependencies

- Node >= v12
- Loopback v3
- Couchbase >= v5

## How to run service locally

```bash
# Install dependencies.
yarn

# Prepare Couchbase cluster
yarn docker-up
# Create Couchbase QueryView
yarn pretest

# Run unit test
yarn test

# Run APP
yarn start

# Remove Couchbase cluster
yarn docker-down
```



## How to use

### Add town

```js

```

### Add path

### Get all paths

### Calculate cost for given route

### Find routes for given start town and end town



## API Specs (TBD, check [unit test]() for more deteils)

## Environment Variables

```bash
# Server
ROOT_CA_FILE # CA file
USER_ID_HEADER  # user identifier header name

# Sentry
SENTRY_DSN
SENTRY_ENVIRONMENT

# Log
LOG_NAME='delivery'
LOG_STREAM='file'
SYSLOG_HOST
SYSLOG_PORT
SYSLOG_PROTO

# Couchbase
CB_HOSTS='http://localhost:8091'
CB_USER='Administrator'
CB_PASS='password'
CB_BUCKET_NAME='delivery'
CB_TIMEOUT='15000'
```