import {Insert} from "./constants";
import {EventCallback} from "./auth";

enum DBType {
    JSON = "JSON",
    XML = "XML"
}

enum ContentType {
    JSON = "application/json",
    XML = "application/xml"
}

interface DatabaseInfo {
    name: string
    type: string
    resources: string[]
}

interface LoginInfo {
    username: string
    password: string
}

interface AuthData {
    access_token: string
    expires_in: number
    expires_at: number
    refresh_expires_in: number
    refresh_token: string
    token_type: string
    not_before_policy: number
    session_state: string
    scope: string
}


interface Params {
    [key: string]: string;
}

type Revision = number | Date

interface ReadParams {
    nodeId?: number,
    maxLevel?: number,
    withMetadata?: MetaType,
    prettyPrint?: boolean,
    revision?: number,
    "revision-timestamp"?: string,
    "start-revision"?: number,
    "end-revision"?: number,
    "start-revision-timestamp"?: string,
    "end-revision-timestamp"?: string,
    lastTopLevelNodeKey?: number,
    nextTopLevelNodes?: number
}

enum MetaType {
    ALL = "true",
    KEY = "nodeKey",
    KEYAndChild = "nodeKeyAndChildCount"
}

interface DiffParams {
    "first-revision"?: string | number,
    "second-revision"?: string | number,
    startNodeKey?: number,
    maxDepth?: number
}

interface UpdateParams {
    nodeId: number,
    data: any,
    insert?: Insert,
    etag?: string
}

interface QueryParams {
    query: string,
    startResultSeqIndex?: number,
    endResultSeqIndex?: number
}

interface Commit {
    revisionTimestamp: string,
    revision: number,
    author: string,
    commitMessage: string,
}

interface DiffResponse {
    database: string,
    resource: string,
    "old-revision": number,
    "new-revision": number,
    diffs: Diff[]
}

type insertPosition = "asFirstChild" | "asLeftSibling" | "asRightSibling" | "replace";
type dataType = "string" | "number" | "boolean" | "null" | "jsonFragment";

interface InsertDiff {
    insert: {
        nodeKey: number,
        insertPositionNodeKey: number,
        insertPosition: insertPosition,
        deweyID: string,
        depth: number,
        type: dataType,
        data: string
    }
}

interface ReplaceDiff {
    replace: {
        oldNodeKey: number,
        newNodeKey: number,
        deweyID: string,
        depth: number,
        type: dataType,
        data: string
    }
}

interface UpdateDiff {
    update: {
        nodeKey: number,
        type: dataType,
        value: string | number | boolean
    }
}

interface DeleteDiff {
    delete: {
        nodeKey: number,
        deweyID: string,
        depth: number
    }
}

type Diff = InsertDiff | ReplaceDiff | UpdateDiff | DeleteDiff;

enum NodeType {
    OBJECT = "OBJECT",
    ARRAY = "ARRAY",
    OBJECT_KEY = "OBJECT_KEY",
    OBJECT_STRING_VALUE = "OBJECT_STRING_VALUE",
    STRING_VALUE = "STRING_VALUE",
    OBJECT_NUMBER_VALUE = "OBJECT_NUMBER_VALUE",
    NUMBER_VALUE = "NUMBER_VALUE",
    OBJECT_BOOLEAN_VALUE = "OBJECT_BOOLEAN_VALUE",
    BOOLEAN_VALUE = "BOOLEAN_VALUE",
    OBJECT_NULL_VALUE = "OBJECT_NULL_VALUE",
    NULL_VALUE = "NULL_VALUE"
}

interface Metadata {
    nodeKey: number;
    hash: number;
    type: NodeType;
    descendantCount?: number; // only for type OBJECT and ARRAY
    childCount?: number; // only for type OBJECT and ARRAY
}

interface MetaNode {
    metadata: Metadata;
    key?: string; // if metadata.type === OBJECT_KEY
    value:
        | MetaNode[]  // if metadata.type === OBJECT or ARRAY alternatively
        | {}      // if can be an empty object, if metadata.childCount === 0
        | []      // or an empty array, depending on whether type is OBJECT or ARRAY
        | MetaNode    // if metadata.type === OBJECT_KEY
        | string  // if metadata.type === OBJECT_STRING_VALUE or STRING_VALUE
        | number  // if metadata.type === OBJECT_NUMBER_VALUE or NUMBER_VALUE
        | boolean // if metadata.type === OBJECT_BOOLEAN_VALUE or BOOLEAN_VALUE
        | null;   // if metadata.type === OBJECT_NULL_VALUE or NULL_VALUE
}

interface EventCallbacks {
    uploadProgressCallback: EventCallback;
    loadCallback: EventCallback;
    errorCallback: EventCallback;
}

export {
    DBType,
    ContentType,
    DatabaseInfo,
    LoginInfo,
    AuthData,
    Revision,
    Params,
    ReadParams,
    MetaType,
    Metadata,
    DiffParams,
    UpdateParams,
    QueryParams,
    Commit,
    DiffResponse,
    InsertDiff,
    ReplaceDiff,
    UpdateDiff,
    DeleteDiff,
    Diff,
    MetaNode,
    NodeType,
    EventCallbacks,
}
