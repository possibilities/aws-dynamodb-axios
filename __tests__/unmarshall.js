const { unmarshall } = require('../index')

describe('unmarshall', () => {
  test('unpacks scalar values', async () => {
    expect(unmarshall({ S: 'foo' })).toEqual('foo')
    expect(unmarshall({ N: '2' })).toEqual(2)
    expect(unmarshall({ NULL: true })).toEqual(null)
    expect(unmarshall({ BOOL: true })).toEqual(true)
    expect(unmarshall({ BOOL: false })).toEqual(false)
    expect(unmarshall({ M: { foo: { S: 'bar' }, moof: { S: 'doof' } } }))
      .toEqual({ foo: 'bar', moof: 'doof' })
    expect(unmarshall({ SS: ['foo', 'bar'] }))
      .toEqual(['foo', 'bar'])
  })

  test('unpacks objects', async () => {
    expect(unmarshall({
      string: { S: 'foo' },
      number: { N: '2' },
      null: { NULL: true },
      boolTruthy: { BOOL: true },
      boolFalsy: { BOOL: false },
      map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } },
      stringset: { SS: ['foo', 'bar'] }
    })).toEqual({
      string: 'foo',
      number: 2,
      null: null,
      boolTruthy: true,
      boolFalsy: false,
      map: { foo: 'bar', moof: 'doof' },
      stringset: ['foo', 'bar']
    })
  })

  test('unpacks arrays', async () => {
    expect(unmarshall([
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false },
        map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } },
        stringset: { SS: ['foo', 'bar'] }
      },
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false },
        map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } },
        stringset: { SS: ['foo', 'bar'] }
      }
    ])).toEqual([
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false,
        map: { foo: 'bar', moof: 'doof' },
        stringset: ['foo', 'bar']
      },
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false,
        map: { foo: 'bar', moof: 'doof' },
        stringset: ['foo', 'bar']
      }
    ])
  })
})
