const configureDb = require('../index')
const clearDatabase = require('../modules/testing/clearDatabase')
const marshall = require('../marshall')
const unmarshall = require('../unmarshall')

const db = configureDb({ region: 'us-east-1', host: '127.0.0.1:9987' })

const testTableName = 'dynamodb-client-tests'

describe('client', () => {
  beforeEach(async () => clearDatabase(db, testTableName))

  test('#put', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar' })
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items)).toEqual([{ pk: 'foo', sk: 'bar' }])
  })

  test('#get', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar' })
    })
    const fetched = await db.get({
      TableName: testTableName,
      Key: marshall({ pk: 'foo', sk: 'bar' })
    })
    expect(unmarshall(fetched.Item.pk)).toBe('foo')
    expect(unmarshall(fetched.Item.sk)).toBe('bar')
  })

  test('#update', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar', foo: 'before' })
    })
    await db.update({
      TableName: testTableName,
      Key: marshall({ pk: 'foo', sk: 'bar' }),
      UpdateExpression: 'set foo = :val',
      ExpressionAttributeValues: {
        ':val': 'after'
      }
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items).map(i => i.foo)).toEqual(['after'])
  })

  test('#delete', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar' })
    })
    await db.delete({
      TableName: testTableName,
      Key: marshall({ pk: 'foo', sk: 'bar' })
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items)).toEqual([])
  })

  test('#query', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar#1' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'bar#2' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: 'foo', sk: 'fuff#2' })
    })
    const { Items: items } = await db.query({
      TableName: testTableName,
      KeyConditionExpression: 'pk = :subjectId and begins_with(sk, :role)',
      ExpressionAttributeValues: marshall({
        ':subjectId': 'foo',
        ':role': 'bar#'
      })
    })
    expect(unmarshall(items)).toHaveLength(2)
  })

  test('#scan', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '1', sk: 'a' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '2', sk: 'b' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '3', sk: 'c' })
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items).map(i => i.pk).sort()).toEqual(['1', '2', '3'])
  })

  test('#batchWrite', async () => {
    await db.batchWrite({
      RequestItems: {
        [testTableName]: [
          { PutRequest: { Item: marshall({ pk: '1', sk: 'a' }) } },
          { PutRequest: { Item: marshall({ pk: '2', sk: 'b' }) } },
          { PutRequest: { Item: marshall({ pk: '3', sk: 'c' }) } }
        ]
      }
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items).map(i => i.pk).sort()).toEqual(['1', '2', '3'])
  })

  test('#batchGet', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '1', sk: 'a' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '2', sk: 'b' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '3', sk: 'c' })
    })
    const response = await db.batchGet({
      RequestItems: {
        [testTableName]: {
          Keys: marshall([
            { pk: '1', sk: 'a' },
            { pk: '2', sk: 'b' },
            { pk: '3', sk: 'c' }
          ])
        }
      }
    })
    const data = response.Responses[testTableName]
    expect(unmarshall(data).map(i => i.pk).sort())
      .toEqual(['1', '2', '3'])
  })

  test('#transactWrite', async () => {
    await db.transactWrite({
      TransactItems: [
        { Put: { TableName: testTableName, Item: marshall({ pk: '1', sk: 'a' }) } },
        { Put: { TableName: testTableName, Item: marshall({ pk: '2', sk: 'b' }) } },
        { Put: { TableName: testTableName, Item: marshall({ pk: '3', sk: 'c' }) } }
      ]
    })
    const { Items: items } =
      await db.scan({ TableName: testTableName })
    expect(unmarshall(items).map(i => i.pk).sort()).toEqual(['1', '2', '3'])
  })

  test('#transactGet', async () => {
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '1', sk: 'a' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '2', sk: 'b' })
    })
    await db.put({
      TableName: testTableName,
      Item: marshall({ pk: '3', sk: 'c' })
    })
    const response = await db.transactGet({
      TransactItems: [
        { Get: { Key: marshall({ pk: '1', sk: 'a' }), TableName: testTableName } },
        { Get: { Key: marshall({ pk: '2', sk: 'b' }), TableName: testTableName } },
        { Get: { Key: marshall({ pk: '3', sk: 'c' }), TableName: testTableName } }
      ]
    })
    expect(unmarshall(response.Responses).map(r => r.Item.pk).sort())
      .toEqual(['1', '2', '3'])
  })
})
