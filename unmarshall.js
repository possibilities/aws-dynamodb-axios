const mapValues = require('./modules/mapValues')

// A minimal replacement for AWS Converter. Mainly this was added
// because the SDK resists bundling with rollup.
// https://github.com/aws/aws-sdk-js/issues/1769

const unmarshall = attributeValue => {
  if (attributeValue === null || attributeValue === undefined) return null
  const key = Object.keys(attributeValue).pop()
  const val = Object.values(attributeValue).pop()
  if (!['S', 'N', 'NULL', 'BOOL'].includes(key)) {
    if (Array.isArray(attributeValue)) {
      return attributeValue.map(unmarshall)
    } else {
      return mapValues(attributeValue, unmarshall)
    }
  }
  if (key === 'S') return val
  if (key === 'N') return parseInt(val, 10)
  if (key === 'NULL' && val === true) return null
  if (key === 'BOOL') return val
  throw new Error(`Unmarshalling type \`${key}\` is not yet supported`)
}

module.exports = unmarshall
