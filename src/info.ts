import {Insert} from "./constants";

enum DBType {
    JSON = "JSON",
    XML = "XML"
}

enum ContentType {
    JSON = "application/json",
    XML = "application/xml"
}

interface SirixInfo {
    sirixUri: string
    databaseInfo?: DatabaseInfo[]
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

export interface StringMap {
    [key: string]: string | number;
}

type Revision = number | Date

interface ReadParams {
    nodeId?: number,
    maxLevel?: number,
    withMetadata?: boolean | string,
    revision?: number,
    "revision-timestamp"?: string,
    "start-revision"?: number,
    "end-revision"?: number,
    "start-revision-timestamp"?: string,
    "end-revision-timestamp"?: string
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
    startResultSeqIndex: number,
    endResultSeqIndex: number
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

interface Diff {
    insert?: {
        oldNodeKey: number,
        newNodeKey: number,
        insertPositionNodeKey: number,
        insertPosition: string,
        type: string,
        data: string
    },
    replace?: {
        oldNodeKey: number,
        newNodeKey: number,
        type: string,
        data: string
    },
    update?: {
        nodeKey: number,
        type: string,
        value: string | number | boolean
    },
    delete?: number
}

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
    key?:
        | string; // if metadata.type === OBJECT_KEY
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

export {
    DBType,
    ContentType,
    SirixInfo,
    DatabaseInfo,
    LoginInfo,
    AuthData,
    Revision,
    ReadParams,
    DiffParams,
    UpdateParams,
    QueryParams,
    Commit,
    DiffResponse,
    Diff,
    MetaNode,
    NodeType
}