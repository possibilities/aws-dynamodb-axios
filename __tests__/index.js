const dynamodb = require('../index')
const clearDatabase = require('../modules/testing/clearDatabase')
const marshall = require('../marshall')
const unmarshall = require('../unmarshall')

const db = dynamodb({
  region: process.env.dynamoDbRegion,
  host: process.env.dynamoDbHost
})

const testTableName = process.env.dynamoDbTableName

describe('client', () => {
  describe('actions', () => {
    beforeEach(async () => clearDatabase(db, testTableName))

    test('#put', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar' })
      })
      const { Items: items } =
        await db.scan({ TableName: testTableName })
      expect(unmarshall(items)).toEqual([{ hash: 'foo', range: 'bar' }])
    })

    test('#get', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar' })
      })
      const fetched = await db.get({
        TableName: testTableName,
        Key: marshall({ hash: 'foo', range: 'bar' })
      })
      expect(unmarshall(fetched.Item.hash)).toBe('foo')
      expect(unmarshall(fetched.Item.range)).toBe('bar')
    })

    test('#update', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar', foo: 'before' })
      })
      await db.update({
        TableName: testTableName,
        Key: marshall({ hash: 'foo', range: 'bar' }),
        UpdateExpression: 'set foo = :val',
        ExpressionAttributeValues: marshall({
          ':val': 'after'
        })
      })
      const { Items: items } = await db.scan({ TableName: testTableName })
      expect(unmarshall(items).map(i => i.foo)).toEqual(['after'])
    })

    test('#delete', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar' })
      })
      await db.delete({
        TableName: testTableName,
        Key: marshall({ hash: 'foo', range: 'bar' })
      })
      const { Items: items } =
        await db.scan({ TableName: testTableName })
      expect(unmarshall(items)).toEqual([])
    })

    test('#query', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar#1' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'bar#2' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: 'foo', range: 'fuff#2' })
      })
      const { Items: items } = await db.query({
        TableName: testTableName,
        KeyConditionExpression: '#hash = :subjectId and begins_with(#range, :role)',
        ExpressionAttributeValues: marshall({
          ':subjectId': 'foo',
          ':role': 'bar#'
        }),
        ExpressionAttributeNames: {
          '#hash': 'hash',
          '#range': 'range',
        }
      })
      expect(unmarshall(items)).toHaveLength(2)
    })

    test('#scan', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '1', range: 'a' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '2', range: 'b' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '3', range: 'c' })
      })
      const { Items: items } =
        await db.scan({ TableName: testTableName })
      expect(unmarshall(items).map(i => i.hash).sort()).toEqual(['1', '2', '3'])
    })

    test('#batchWrite', async () => {
      await db.batchWrite({
        RequestItems: {
          [testTableName]: [
            { PutRequest: { Item: marshall({ hash: '1', range: 'a' }) } },
            { PutRequest: { Item: marshall({ hash: '2', range: 'b' }) } },
            { PutRequest: { Item: marshall({ hash: '3', range: 'c' }) } }
          ]
        }
      })
      const { Items: items } =
        await db.scan({ TableName: testTableName })
      expect(unmarshall(items).map(i => i.hash).sort()).toEqual(['1', '2', '3'])
    })

    test('#batchGet', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '1', range: 'a' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '2', range: 'b' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '3', range: 'c' })
      })
      const response = await db.batchGet({
        RequestItems: {
          [testTableName]: {
            Keys: marshall([
              { hash: '1', range: 'a' },
              { hash: '2', range: 'b' },
              { hash: '3', range: 'c' }
            ])
          }
        }
      })
      const data = response.Responses[testTableName]
      expect(unmarshall(data).map(i => i.hash).sort())
        .toEqual(['1', '2', '3'])
    })

    test('#transactWrite', async () => {
      await db.transactWrite({
        TransactItems: [
          { Put: { TableName: testTableName, Item: marshall({ hash: '1', range: 'a' }) } },
          { Put: { TableName: testTableName, Item: marshall({ hash: '2', range: 'b' }) } },
          { Put: { TableName: testTableName, Item: marshall({ hash: '3', range: 'c' }) } }
        ]
      })
      const { Items: items } =
        await db.scan({ TableName: testTableName })
      expect(unmarshall(items).map(i => i.hash).sort()).toEqual(['1', '2', '3'])
    })

    test('#transactGet', async () => {
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '1', range: 'a' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '2', range: 'b' })
      })
      await db.put({
        TableName: testTableName,
        Item: marshall({ hash: '3', range: 'c' })
      })
      const response = await db.transactGet({
        TransactItems: [
          { Get: { Key: marshall({ hash: '1', range: 'a' }), TableName: testTableName } },
          { Get: { Key: marshall({ hash: '2', range: 'b' }), TableName: testTableName } },
          { Get: { Key: marshall({ hash: '3', range: 'c' }), TableName: testTableName } }
        ]
      })
      expect(unmarshall(response.Responses).map(r => r.Item.hash).sort())
        .toEqual(['1', '2', '3'])
    })
  })

  test('error normalization', async () => {
    try {
      await db.put({ TableName: testTableName })
    } catch (error) {
      expect(error.statusCode).toEqual(400)
      expect(error.message).toEqual(error.data.message)
      expect(error.data.__type.endsWith('ValidationException')).toBeTruthy()
      return
    }
    expect(false).toBeTruthy()
  })
})
