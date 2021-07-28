'use strict';
const AWS = require('aws-sdk');
const awsConfig = {
  region: 'us-east-2',
};
AWS.config.update(awsConfig);

const table = 'UserSessions';
const dynamo = AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const currentTime = Date.now();
  const key = { sessionId: event.sessionId };

  const response = await dynamo
    .getItem({
      TableName: table,
      Key: key,
    })
    .promise();

  let session = response.Item;

  if (currentTime >= session.expires) {
    if (session.isActive) {
      // invalidate session if session is active and it is expired
      dynamo.updateItem({
        TableName: table,
        Key: key,
        UpdateExpression: 'SET isActive = :isActive',
        ExpressionAttributeValues: {
          isActive: false,
        },
      });

      // return update session info
      return { ...session, isActive: false };
    }

    return session;
  }

  const newExpires = currentTime + 1000 * 60 * 60 * 24 * 14; // 14 days from now
  // extend session
  dynamo.updateItem({
    TableName: table,
    Key: key,
    UpdateExpression: 'SET expires = :expires',
    ExpressionAttributeValues: {
      ':expires': newExpires,
    },
  });

  // return session info with new expiry date
  return { ...session, expires: newExpires };
};
