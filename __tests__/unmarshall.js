const unmarshall = require('../unmarshall')

describe('unmarshall', () => {
  test('unpacks scalar values', async () => {
    expect(unmarshall({ S: 'foo' })).toEqual('foo')
    expect(unmarshall({ N: '2' })).toEqual(2)
    expect(unmarshall({ NULL: true })).toEqual(null)
    expect(unmarshall({ BOOL: true })).toEqual(true)
    expect(unmarshall({ BOOL: false })).toEqual(false)
  })

  test('unpacks objects', async () => {
    expect(unmarshall({
      string: { S: 'foo' },
      number: { N: '2' },
      null: { NULL: true },
      boolTruthy: { BOOL: true },
      boolFalsy: { BOOL: false }
    })).toEqual({
      string: 'foo',
      number: 2,
      null: null,
      boolTruthy: true,
      boolFalsy: false
    })
  })

  test('unpacks arrays', async () => {
    expect(unmarshall([
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false }
      },
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false }
      }
    ])).toEqual([
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false
      },
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false
      }
    ])
  })
})
