import {ContentType, DBType} from "./info";

export function contentType(dbType: DBType) {
    if (dbType === DBType.JSON) {
        return ContentType.JSON;
    }
    return ContentType.XML;
}

export enum Insert {
    CHILD = "asFirstChild",
    LEFT = "asLeftSibling",
    RIGHT = "asRightSibling",
    REPLACE = "replace"
}