const dynamodb = require('../../index')

const db = dynamodb({
  region: process.env.dynamoDbRegion,
  host: process.env.dynamoDbHost
})

const testTableName = process.env.dynamoDbTableName

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
