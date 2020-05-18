import { ContentType, DBType } from "./info";
export declare function contentType(dbType: DBType): ContentType;
export declare enum Insert {
    CHILD = "asFirstChild",
    LEFT = "asLeftSibling",
    RIGHT = "asRightSibling",
    REPLACE = "replace"
}
