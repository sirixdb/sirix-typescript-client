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
    clientId: string;
}
interface AuthData {
    access_token: string;
    expires_in: number;
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
interface Metadata {
    nodeKey: number;
    hash: number;
    type: string;
    descendantCount?: number;
    childCount?: number;
}
interface MetaNode {
    metadata: Metadata;
    key?: string;
    value: Node[] | {} | [] | Node | string | number | boolean | null;
}
export { SirixInfo, DatabaseInfo, LoginInfo, AuthData, Revision, ReadParams, Commit, MetaNode };
