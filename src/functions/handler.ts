
import { Delete_Failure_Message, Delete_Success_Message, Dyanamo_DB_GET_Error, Failure_Code, Failure_Message, Success_Code, Success_Message } from "src/constants/UserConstants";
import { appsyncGetDB, appsyncSaveDB } from "src/db/appsync";
import { DBConfig } from "src/db/DBConfig";
import { UserDetailsServices } from "src/services/UserDetailsServices";


export async function getALLUserInfo(): Promise<any> {

    let response: any;
    let userDetailService = new UserDetailsServices();
    let configDB = new DBConfig();

    try {

        const dataItemObj = await configDB.dbGetAllUserInfoService();
        response = userDetailService.responseObject(Success_Code, JSON.stringify(dataItemObj));
        console.log('response - ', response);

    } catch (err) {

        response = userDetailService.responseObject(Failure_Code, Dyanamo_DB_GET_Error);
        console.log(err.message);
    }

    return response;
}

export async function getUserDetailsById(event: any): Promise<any> {

    let response: any;
    let userDetailService = new UserDetailsServices();
    //let configDB = new DBConfig();
    try {
        // const dataItemObj = await configDB.dbUserInfoService(event);
        // response = userDetailService.responseObject(Success_Code, JSON.stringify(dataItemObj.Item));
        // console.log('response - ', response);
        response = await appsyncGetDB(event, null);
        const params = {
            firstName: response.getUserInfoDevTable.firstName,
            lastName: response.getUserInfoDevTable.lastName,
            age: response.getUserInfoDevTable.age,
            gender: response.getUserInfoDevTable.gender,
            department: response.getUserInfoDevTable.department
        };
        console.log(params);
        response = userDetailService.responseObject(Success_Code, JSON.stringify(params));
    } catch (err) {

        response = userDetailService.responseObject(Failure_Code, Dyanamo_DB_GET_Error);
        console.log(err.message);
    }
    return response;

}

export async function saveUserInfoDetails(event: any) {
    let response: any;
    let responseObj: any;
    let userDetailService = new UserDetailsServices();
    //let configDB = new DBConfig();

    try {

        //await configDB.dbSaveUserInfoService(event);
        responseObj = await appsyncSaveDB(event);
        response = userDetailService.responseObject(Success_Code, responseObj);
        console.log('response - ', response);

    } catch (err) {

        response = userDetailService.responseObject(Failure_Code, Failure_Message);
        console.log(err.message);
    }

    return response;
}

export async function updateUserInfoDetails(event: any): Promise<any> {

    let response: any;
    let userDetailService = new UserDetailsServices();
    let configDB = new DBConfig();

    try {

        await configDB.dbUpdateUserInfoService(event);
        response = userDetailService.responseObject(Success_Code, `${event.pathParameters.userId} - ${Success_Message}`);
        console.log('response - ', response);

    } catch (err) {
        response = userDetailService.responseObject(Failure_Code, `${event.pathParameters.userId} - ${Failure_Message}`);
        console.log(err.message);
    }

    return response;
}

export async function deleteUserInfoById(event: any): Promise<any> {

    let response: any;
    let userDetailService = new UserDetailsServices();
    let configDB = new DBConfig();

    try {
        await configDB.dbDeleteUserInfoService(event);
        response = userDetailService.responseObject(Success_Code, `${event.pathParameters.userId} - ${Delete_Success_Message}`);
        console.log('response - ', response);

    } catch (err) {

        response = userDetailService.responseObject(Failure_Code, `${event.pathParameters.userId} - ${Delete_Failure_Message}`);
        console.log(err.message);
    }

    return response;
}




