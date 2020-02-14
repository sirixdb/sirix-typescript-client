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
  clientId: string
}

interface AuthData {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  refresh_token: string
  token_type: string
  not_before_policy: number
  session_state: string
  scope: string
}

type Revision = number | Date

interface ReadParams {
  nodeId?: number,
  maxLevel?: number,
  withMetadata?: boolean,
  revision?: number,
  "revision-timestamp"?: string,
  "start-revision"?: number,
  "end-revision"?: number,
  "start-revision-timestamp"?: string,
  "end-revision-timestamp"?: string
}

interface Commit {
  revisionTimestamp: string,
  revision: number,
  author: string,
  commitMessage: string,
}

interface Metadata {
  nodeKey: number;
  hash: number;
  type: string;
  descendantCount?: number; // only for type "OBJECT" and "ARRAY"
  childCount?: number; // only for type "OBJECT" and "ARRAY"
}
interface MetaNode {
  metadata: Metadata;
  key?:
    | string; // if metadata.type === "OBJECT_KEY"
  value:
    | Node[]  // if metadata.type === "OBJECT" or "ARRAY" alternatively
    | {}      // if can be an empty object, if metadata.childCount === 0
    | []      // or an empty array, depending on whether type is "OBJECT" or "ARRAY"
    | Node    // if metadata.type === "OBJECT_KEY"
    | string  // if metadata.type === "OBJECT_STRING_VALUE" or "STRING_VALUE"
    | number  // if metadata.type === "OBJECT_NUMBER_VALUE" or "NUMBER_VALUE"
    | boolean // if metadata.type === "OBJECT_BOOLEAN_VALUE" or "BOOLEAN_VALUE"
    | null;   // if metadata.type === "OBJECT_NULL_VALUE" or "NULL_VALUE"
}

export { SirixInfo, DatabaseInfo, LoginInfo, AuthData, Revision, ReadParams, Commit, MetaNode }