const { marshall } = require('../index')

describe('marshall', () => {
  test('packs scalar values', async () => {
    expect(marshall('foo')).toEqual({ S: 'foo' })
    expect(marshall(2)).toEqual({ N: '2' })
    expect(marshall(null)).toEqual({ NULL: true })
    expect(marshall(true)).toEqual({ BOOL: true })
    expect(marshall(false)).toEqual({ BOOL: false })
    expect(marshall({ foo: 'bar' })).toEqual({ foo: { S: 'bar' } })
    expect(marshall(undefined)).toEqual(undefined)
  })

  test('packs objects', async () => {
    expect(marshall({
      string: 'foo',
      number: 2,
      null: null,
      boolTruthy: true,
      boolFalsy: false,
      map: { foo: 'bar', moof: 'doof' }
    })).toEqual({
      string: { S: 'foo' },
      number: { N: '2' },
      null: { NULL: true },
      boolTruthy: { BOOL: true },
      boolFalsy: { BOOL: false },
      map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } }
    })
  })

  test('packs arrays', async () => {
    expect(marshall([
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false,
        map: { foo: 'bar', moof: 'doof' }
      },
      {
        string: 'foo',
        number: 2,
        null: null,
        boolTruthy: true,
        boolFalsy: false,
        map: { foo: 'bar', moof: 'doof' }
      }
    ])).toEqual([
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false },
        map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } }
      },
      {
        string: { S: 'foo' },
        number: { N: '2' },
        null: { NULL: true },
        boolTruthy: { BOOL: true },
        boolFalsy: { BOOL: false },
        map: { M: { foo: { S: 'bar' }, moof: { S: 'doof' } } }
      }
    ])
  })
})
