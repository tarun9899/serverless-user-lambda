import * as uuid from "uuid";
import { User_Table_Name } from "src/constants/UserConstants";
const AWS = require('aws-sdk');

export class DBConfig {
    public documentClient = new AWS.DynamoDB.DocumentClient();
    public dbGetAllParams() {
        const params = {
            TableName: User_Table_Name,
        }
        console.log('params - ', params);
        return params;
    }

    public async dbGetAllUserInfoService() {
        return await this.documentClient.scan(this.dbGetAllParams()).promise();
    }

    public dbGetParams(event: any) {
        const id = event.pathParameters.userId;
        const params = {
            TableName: User_Table_Name,
            Key: {
                userId: id
            }
        }
        console.log('params - ', params);
        return params;
    }

    public async dbUserInfoService(event: any) {
        console.log('event - ', event);
        return await this.documentClient.get(this.dbGetParams(event)).promise();
    }

    public dbPostParams(event: any) {
        const { firstName, lastName, gender, age, department } = JSON.parse(event.body);
        const params = {
            TableName: User_Table_Name,
            Item: {
                userId: uuid.v4(),
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                age: age,
                department: department
            }
        }
        console.log('params - ', params);
        return params;
    }

    public async dbSaveUserInfoService(event: any) {
        console.log('event - ', event);
        return await this.documentClient.put(this.dbPostParams(event)).promise();
    }


    public dbUpdateParams(event: any) {
        const userId = event.pathParameters.userId;
        const { firstName } = JSON.parse(event.body);
        const params = {
            TableName: User_Table_Name,
            Key: {
                userId: userId
            },
            UpdateExpression:
                `set firstName= :value`,
            ExpressionAttributeValues: {
                ":value": firstName
            }
        }
        console.log('params - ', params);
        return params;
    }

    public async dbUpdateUserInfoService(event: any) {
        console.log('event - ', event);
        return await this.documentClient.update(this.dbUpdateParams(event)).promise();
    }


    public dbDeleteParams(event: any) {
        const id = event.pathParameters.userId;
        const params = {
            TableName: User_Table_Name,
            Key: {
                userId: id
            }
        }
        console.log('params - ', params);
        return params;
    }

    public async dbDeleteUserInfoService(event: any) {
        console.log('event - ', event);
        return await this.documentClient.delete(this.dbDeleteParams(event)).promise();
    }

}