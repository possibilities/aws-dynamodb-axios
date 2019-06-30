const configureDb = require('../../index')
const db = configureDb({ region: 'us-east-1', host: '127.0.0.1:9987' })

const testTableName = 'dynamodb-client-tests'

module.exports = async () => {
  const existingTable = await db.describeTable({
    TableName: testTableName
  }).catch(() => null)
  if (!existingTable) {
    console.info(`\nCreating \`${testTableName}\` table...`)
    await db.createTable({
      TableName: testTableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ]
    })
    while (true) {
      const description = await db.describeTable({ TableName: testTableName })
      if (description.Table.TableStatus === 'ACTIVE') {
        break
      }
    }
  }
}
