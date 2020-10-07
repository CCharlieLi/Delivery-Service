# Delivery Service

[![Build Status](https://travis-ci.com/CCharlieLi/Delivery-Service.svg?branch=main)](https://travis-ci.com/CCharlieLi/Delivery-Service)
[![Coverage Status](https://coveralls.io/repos/github/CCharlieLi/Delivery-Service/badge.svg?branch=main)](https://coveralls.io/github/CCharlieLi/Delivery-Service?branch=main)


Delivery Service is a NodeJS service component to provide route services for delivery industry. Delivery Service supports the following features:
- Add town(node) information.
- Add path information for existent town.
- Refresh graph with existent towns and paths from DB.
- Calculate cost for given route.
- Find all possible routes for given start point and end point with given limitations. Routes are sorted by cost. Supported limitations:
  - costLimit
  - routeLimit
  - stopLimit
  - pathReuseLimit


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

Common headers:
- `x-transaction-id`: request unique identifier.
- `x-user-id`: user unique identifier.

### Add town

```js
POST /api/towns
{ 
  data: { 
    id: 'A', 
    name: 'A Town' 
    } 
}

// Response: 200
// {
//   data: {
//     id: 'town:A',
//     name: 'A Town',
//     createdAt: '2020-10-07T13:59:27.478Z',
//     updatedAt: '2020-10-07T13:59:27.478Z'
//   }
// }
```

### Add path

```js
POST /api/paths
{ 
  data: { 
    start: 'A', 
    end: 'B', 
    cost: 12 
  } 
}
// Response: 204
```

### Get all paths

```js
GET /api/paths
// Response: 200
// {
//   "meta": { 
//     "total":3
//   },
//   "data":[
//     {"A":{"B":3,"C":4}},
//     {"B":{"C":14}},
//     {"C":{"A":8,"B":1}}
//   ]
// }
```

### Calculate cost for given route

```js
GET /api/routes/A-B-C-D-A/cost
// Response: 200
// {
//   data: 10
// }
```

### Find routes for given start town and end town

```js
GET /api/routes?start=E&end=D&stopLimit=4
// Response: 200
// {
//   "data": [
//     {
//       "nodes": [
//         "E",
//         "A",
//         "C",
//         "F",
//         "D"
//       ],
//       "paths": {
//         "E-A": 1,
//         "A-C": 1,
//         "C-F": 1,
//         "F-D": 1
//       },
//       "cost": 9
//     },
//     {
//       "nodes": [
//         "E",
//         "A",
//         "C",
//         "D"
//       ],
//       "paths": {
//         "E-A": 1,
//         "A-C": 1,
//         "C-D": 1
//       },
//       "cost": 10
//     },
//     {
//       "nodes": [
//         "E",
//         "A",
//         "D"
//       ],
//       "paths": {
//         "E-A": 1,
//         "A-D": 1
//       },
//       "cost": 12
//     },
//     {
//       "nodes": [
//         "E",
//         "B",
//         "E",
//         "A",
//         "D"
//       ],
//       "paths": {
//         "E-B": 1,
//         "B-E": 1,
//         "E-A": 1,
//         "A-D": 1
//       },
//       "cost": 18
//     }
//   ]
// }
```






### Refresh graph

```js
POST /api/routes/refresh
// Response: 204
```

## API Specs (TBD, check [unit test](https://github.com/CCharlieLi/Delivery-Service/tree/main/test) for more deteils)

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