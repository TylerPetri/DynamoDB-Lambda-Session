'use strict';
const AWS = require('aws-sdk');
const awsConfig = {
  region: 'us-east-2',
};
AWS.config.update(awsConfig);

const table = 'UserSessions';
const dynamo = AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const session = await dynamo.updateItem({
    TableName: table,
    Key: {
      sessionId: event.sessionId,
    },
    UpdateExpression: 'SET isActive = :isActive',
    ExpressionAttributeValues: {
      ':isActive': false,
    },
    ReturnValues: 'ALL_NEW',
  });

  return session.Attributes;
};
