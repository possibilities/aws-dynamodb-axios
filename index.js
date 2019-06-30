const request = require('axios')
const aws4 = require('aws4')
const createError = require('./modules/createError')
const omit = require('./modules/omit')
const { apiVersion, regionToEndpoint } = require('./constants')

const credentials = {
  sessionToken: process.env.AWS_SESSION_TOKEN,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

const makeRequest = (host, action) => async data => {
  // To support local development use non-ssl protocol
  const protocol = host.startsWith('dynamodb.') ? 'https' : 'http'
  const headers = {
    'X-Amz-Target': `DynamoDB_${apiVersion}.${action}`,
    'Content-Type': 'application/x-amz-json-1.0'
  }

  const signedRequest = aws4.sign(
    {
      host,
      headers,
      method: 'POST',
      url: `${protocol}://${host}`,
      // `aws4` expects `body`, `axios` expects `data`
      body: JSON.stringify(data)
    },
    credentials
  )

  let response
  try {
    response = await request({
      data,
      headers,
      ...omit(signedRequest, ['headers', 'body'])
    })
  } catch (error) {
    if (!error.response) throw error
    const { status, data } = error.response
    const dynamoError = createError(status, data.Message, error)
    dynamoError.data = error.response.data
    throw dynamoError
  }

  // When calling GetItem if nothing exists an empty object is returned. Here
  // an empty object is replaced with null as a signal to callee that the item
  // could not be found.
  return Object.keys(response.data).length ? response.data : null
}

const configureDb = (options = {}) => {
  const host = options.host || regionToEndpoint[options.region]
  return {
    put: makeRequest(host, 'PutItem'),
    get: makeRequest(host, 'GetItem'),
    delete: makeRequest(host, 'DeleteItem'),
    query: makeRequest(host, 'Query'),
    scan: makeRequest(host, 'Scan'),
    update: makeRequest(host, 'UpdateItem'),
    createTable: makeRequest(host, 'CreateTable'),
    describeTable: makeRequest(host, 'DescribeTable'),
    transactWrite: makeRequest(host, 'TransactWriteItems'),
    transactGet: makeRequest(host, 'TransactGetItems'),
    batchWrite: makeRequest(host, 'BatchWriteItem'),
    batchGet: makeRequest(host, 'BatchGetItem')
  }
}

module.exports = configureDb
module.exports.marshall = require('./marshall')
module.exports.unmarshall = require('./unmarshall')
