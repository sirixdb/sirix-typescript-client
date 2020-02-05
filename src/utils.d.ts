export declare function contentType(type: string): "application/xml" | "application/json";
export declare function updateData(updated: any, old: any): void;
export declare enum Insert {
    CHILD = "asFirstChild",
    LEFT = "asLeftSibling",
    RIGHT = "asRightSibling",
    REPLACE = "replace"
}
