interface SirixInfo {
    sirixUri: string;
    databaseInfo?: DatabaseInfo[];
}
interface DatabaseInfo {
    name: string;
    type: string;
    resources: string[];
}
interface LoginInfo {
    username: string;
    password: string;
    grant_type: string;
}
interface AuthData {
    access_token: string;
    expires_in: number;
    expires_at: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    not_before_policy: number;
    session_state: string;
    scope: string;
}
declare type Revision = number | Date;
interface ReadParams {
    nodeId?: number;
    maxLevel?: number;
    withMetadata?: boolean;
    revision?: number;
    "revision-timestamp"?: string;
    "start-revision"?: number;
    "end-revision"?: number;
    "start-revision-timestamp"?: string;
    "end-revision-timestamp"?: string;
}
interface Commit {
    revisionTimestamp: string;
    revision: number;
    author: string;
    commitMessage: string;
}
interface DiffResponse {
    database: string;
    resource: string;
    "old-revision": number;
    "new-revision": number;
    diffs: Diff[];
}
interface Diff {
    insert?: {
        oldNodeKey: number;
        newNodeKey: number;
        insertPositionNodeKey: number;
        insertPosition: string;
        type: string;
        data: string;
    };
    replace?: {
        oldNodeKey: number;
        newNodeKey: number;
        type: string;
        data: string;
    };
    update?: {
        nodeKey: number;
        type: string;
        value: string | number | boolean;
    };
    delete?: number;
}
declare enum NodeType {
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
    descendantCount?: number;
    childCount?: number;
}
interface MetaNode {
    metadata: Metadata;
    key?: string;
    value: MetaNode[] | {} | [] | MetaNode | string | number | boolean | null;
}
export { SirixInfo, DatabaseInfo, LoginInfo, AuthData, Revision, ReadParams, Commit, DiffResponse, Diff, MetaNode, NodeType };
