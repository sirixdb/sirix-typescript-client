import {ContentType, DBType} from "./info";

export function contentType(dbType: DBType) {
    if (dbType === DBType.JSON) {
        return ContentType.JSON;
    }
    return ContentType.XML;
}

export enum ServerErrorType {
    NotFound,
    Unauthorized,
    InternalServerError,
    Other,
}

export class ServerError {
    public status: number;
    public message: string;
    public errorType: ServerErrorType;

    constructor(status: number, message: string) {
        this.status = status;
        this.message = message;
        switch (this.status) {
            case 404:
                this.errorType = ServerErrorType.NotFound;
                break;
            case 401:
                this.errorType = ServerErrorType.Unauthorized;
                break;
            case 500:
                this.errorType = ServerErrorType.InternalServerError;
                break;
            default:
                this.errorType = ServerErrorType.Other;
        }
    }
}

export enum Insert {
    CHILD = "asFirstChild",
    LEFT = "asLeftSibling",
    RIGHT = "asRightSibling",
    REPLACE = "replace"
}
