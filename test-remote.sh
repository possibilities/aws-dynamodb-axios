#!/bin/sh

set -e

export dynamoDbRegion=us-east-2
export dynamoDbTableName=AwsDynamoDbAxiosTest

jest --runInBand --verbose "$@"
