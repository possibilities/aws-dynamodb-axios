// Following function copied from
// https://github.com/zeit/micro/blob/master/test/index.js
// The MIT License (MIT)
// Copyright (c) 2018 ZEIT, Inc.
const createError = (code, message, original) => {
  const err = new Error(message)
  err.statusCode = code
  err.originalError = original
  return err
}

module.exports = createError
