const omit = require('./modules/omit')
const converters = require('dynamo-converters')

module.exports = obj => omit(
  converters.dataToItem(obj),
  ['created', 'modified']
)
