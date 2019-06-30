const mapValues = (obj, fn) => {
  let mapped = {}
  Object.keys(obj).forEach(key => {
    mapped[key] = fn(obj[key])
  })
  return mapped
}

module.exports = mapValues
