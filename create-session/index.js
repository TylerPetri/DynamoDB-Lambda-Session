'use strict';
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const awsConfig = {
  region: 'us-east-2',
};
AWS.config.update(awsConfig);

const generateId = (userId) => {
  const hashInput = `${Date.now()}${userId}${Math.floor(
    Math.random() * 100000
  )}`;
  const generatedId = bcrypt.hashSync(hashInput, 10);
  return generatedId;
};

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const user = event;
  const sessionId = generateId(user.id);
  const currentTime = Date.now();

  const sessionInfo = {
    sessionId: sessionId, // Primary Key
    userId: user.id,
    sessionStartTimestamp: currentTime,
    isActive: true,
    expires: currentTime + 1000 * 60 * 60 * 24 * 14,
    userInfo: user,
  };

  await dynamodb
    .putItem({
      TableName: 'UserSessions',
      Item: sessionInfo,
    })
    .promise();

  return sessionInfo;
};
