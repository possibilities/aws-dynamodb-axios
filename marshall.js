const mapValues = require('./modules/mapValues')

// A minimal replacement for AWS Converter. Mainly this was added
// because the SDK resists bundling with rollup.
// https://github.com/aws/aws-sdk-js/issues/1769

const handleObject = obj => {
  return mapValues(obj, (val, key) => {
    if (val !== null && typeof val === 'object') {
      return { M: marshall(val) }
    }
    return marshall(val)
  })
}

const marshall = val => {
  if (val === null) return { NULL: true }
  if (typeof val === 'undefined') return
  if (val === false) return { BOOL: false }
  if (val === true) return { BOOL: true }
  if (typeof val === 'string') return { S: val }
  if (typeof val === 'number') return { N: val.toString() }
  if (Array.isArray(val)) return val.map(marshall)
  if (typeof val === 'object') return handleObject(val)
  throw new Error(false, `Marshalling type \`${typeof val}\` is not yet supported`)
}

module.exports = marshall
