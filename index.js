const axios = require('axios')
const aws4 = require('aws4')
const createError = require('./modules/createError')
const omit = require('./modules/omit')
const { apiVersion, regionToEndpoint } = require('./constants')
const configureDebug = require('debug')

const credentials = {
  sessionToken: process.env.AWS_SESSION_TOKEN,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

const aws4OnlyProperties = ['headers', 'body', 'url', 'host']

const debugRequest = configureDebug('aws-dynamodb-axios:requests')
const debugResponse = configureDebug('aws-dynamodb-axios:responses')
const debugError = configureDebug('aws-dynamodb-axios:errors')

const buildHandler = ({ client, host, url, protocol }) =>
  action =>
    async data => {
      debugRequest('action: %s', action)

      const headers = {
        'X-Amz-Target': `DynamoDB_${apiVersion}.${action}`,
        'Content-Type': 'application/x-amz-json-1.0'
      }

      // `aws4` expects `body`, `axios` expects `data`
      const body = JSON.stringify(data)

      debugRequest('signing request: %O', { url, body, host, headers, method: 'POST' })

      const signedRequest = aws4.sign(
        { url, body, host, headers, method: 'POST' },
        credentials
      )

      let response
      try {
        response = await client({
          data,
          headers,
          ...omit(signedRequest, aws4OnlyProperties)
        })
      } catch (error) {
        debugError('error message: %s', error.message)
        if (!error.response) throw error
        debugError('error data: %O', error.response.data)
        debugError('error status: %s', error.response.status)
        const { status, data: errorData } = error.response
        const dynamoError = createError(status, errorData.message, error)
        dynamoError.data = error.response.data
        throw dynamoError
      }

      debugResponse('response data: %O', response.data)
      return response.data
    }

const dynamodb = (options = {}) => {
  const host = options.host || regionToEndpoint[options.region]

  // To support local development use non-ssl protocol
  const protocol = host.startsWith('dynamodb.') ? 'https' : 'http'
  const url = `${protocol}://${host}`

  const client = axios.create({ baseURL: url })
  const createHandler = buildHandler({ url, host, client })

  return {
    interceptors: client.interceptors,
    put: createHandler('PutItem'),
    get: createHandler('GetItem'),
    delete: createHandler('DeleteItem'),
    query: createHandler('Query'),
    scan: createHandler('Scan'),
    update: createHandler('UpdateItem'),
    createTable: createHandler('CreateTable'),
    describeTable: createHandler('DescribeTable'),
    transactWrite: createHandler('TransactWriteItems'),
    transactGet: createHandler('TransactGetItems'),
    batchWrite: createHandler('BatchWriteItem'),
    batchGet: createHandler('BatchGetItem')
  }
}

module.exports = dynamodb
module.exports.marshall = require('./marshall')
module.exports.unmarshall = require('./unmarshall')
