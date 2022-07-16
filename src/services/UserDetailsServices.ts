import { Application_Json } from "src/constants/UserConstants";

export class UserDetailsServices {

    public responseObject(statusCode: any, responseBody: any) {
        return {
            statusCode: statusCode,
            headers: {
                content_Type: Application_Json,
            },
            body: responseBody
        }
    }
}