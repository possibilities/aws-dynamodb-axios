const { marshall } = require('../index')

describe('marshall', () => {
  test('packs scalar values', async () => {
    expect(marshall('foo')).toEqual({ S: 'foo' })
    expect(marshall(2)).toEqual({ N: '2' })
    expect(marshall(null)).toEqual({ NULL: true })
    expect(marshall(true)).toEqual({ BOOL: true })
    expect(marshall(false)).toEqual({ BOOL: false })
    expect(marshall(undefined)).toEqual(undefined)
  })

  test('packs objects', async () => {
    expect(marshall({
      string: 'foo',
      number: 2,
      null: null,
      boolTruthy: true,
      boolFalsy: false
    })).toEqual({
      string: { S: 'foo' },
      number: { N: '2' },
      null: { NULL: true },
      boolTruthy: { BOOL: true },
      boolFalsy: { BOOL: false }
    })
  })

  test('packs arrays', async () => {
    expect(marshall([
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
    ])).toEqual([
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
    ])
  })
})
