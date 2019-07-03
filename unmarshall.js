const mapValues = require('./modules/mapValues')

// A minimal replacement for AWS Converter. Mainly this was added
// because the SDK resists bundling with rollup.
// https://github.com/aws/aws-sdk-js/issues/1769

const types = {
  S: true,
  N: true,
  NULL: true,
  BOOL: true,
  M: true,
  SS: true
}

const unmarshall = attributeValue => {
  if (attributeValue === null || attributeValue === undefined) return null
  const key = Object.keys(attributeValue).pop()
  const val = Object.values(attributeValue).pop()
  if (!types[key]) {
    if (Array.isArray(attributeValue)) {
      return attributeValue.map(unmarshall)
    } else {
      return mapValues(attributeValue, unmarshall)
    }
  }

  switch (key) {
    case 'S':
      return val
    case 'N':
      return parseInt(val, 10)
    case 'NULL':
      if (val === true) return null
      break
    case 'BOOL':
      return val
    case 'M':
      return unmarshall(val)
    case 'SS':
      return val
  }
  throw new Error(`Unmarshalling type \`${key}\` is not yet supported`)
}

module.exports = unmarshall
