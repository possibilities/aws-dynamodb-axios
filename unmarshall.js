const converters = require('dynamo-converters')
module.exports = obj => converters.itemToData(obj)
