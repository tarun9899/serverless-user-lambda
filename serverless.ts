import type { AWS } from '@serverless/typescript';
import { GraphQL_Appsync_URL } from 'src/constants/UserConstants';

const DynamoTableName = 'User-Info-Dev-Table';
const GraphQLAppsyncUrl = GraphQL_Appsync_URL;
const serverlessConfiguration: AWS = {
  service: 'sls-lmd-dev-user-info',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-west-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DynamoTableName,
      GraphQLAppsyncUrl
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: "*",
      },
    ]
  },
  // import the function via paths
  functions: {
    get: {
      handler: 'src/functions/handler.getUserDetailsById',
      events: [
        {
          http: {
            method: 'get',
            path: '/userinfo/get/{userId}',
            cors: true
          }
        }
      ]
    },
    post: {
      handler: 'src/functions/handler.saveUserInfoDetails',
      events: [
        {
          http: {
            method: 'post',
            path: '/userinfo/post',
            cors: true
          }
        }
      ]
    },
    update: {
      handler: 'src/functions/handler.updateUserInfoDetails',
      events: [
        {
          http: {
            method: 'put',
            path: '/userinfo/update/{userId}',
            cors: true
          }
        }
      ]
    },
    delete: {
      handler: 'src/functions/handler.deleteUserInfoById',
      events: [
        {
          http: {
            method: 'delete',
            path: '/userinfo/delete/{userId}',
            cors: true
          }
        }
      ]
    },
    scan: {
      handler: 'src/functions/handler.getALLUserInfo',
      events: [
        {
          http: {
            method: 'get',
            path: '/userinfo/allUsers',
            cors: true
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      UserInfoDynamoTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "userId",
              AttributeType: "S",
            }
          ],
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: DynamoTableName,
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
