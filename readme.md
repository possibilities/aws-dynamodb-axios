# AWS DynamoDB with Axios [![CircleCI](https://circleci.com/gh/possibilities/aws-dynamodb-axios.svg?style=svg)](https://circleci.com/gh/possibilities/aws-dynamodb-axios)

A small client for [AWS DynamoDB](https://aws.amazon.com/dynamodb/) based on the [Axios request library](https://github.com/axios/axios) and [AWS4](https://github.com/mhart/aws4) inspired by [DynamoDb DocumentClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) and [DynamoDB Converter](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html)

## Motivation

The primary motivation for this library is to have a tools that are similar to DynamoDb tools in the AWS SDK that are [rollup friendly](https://rollupjs.org/guide/en/) for deploying as-small-as-possible bundles to AWS Lambda. In the future if the SDK becomes more bundle-friendly we can deprecate this project. TODO provide more context and bundle size info.

## Usage

For now see [test suite](./__tests__) for usage

## API

### Client

#### Configure

##### `dynamodb()`

#### Operations

##### `get()`

##### `put()`

##### `update()`

##### `delete()`

##### `query()`

##### `scan()`

##### `batchGet()`

##### `batchWrite()`

##### `transactGet()`

##### `transactWrite()`

##### `createTable()`

##### `describeTable()`

### Conversion

##### `marshall(obj|arr)`

##### `unmarshall(obj|arr)`
