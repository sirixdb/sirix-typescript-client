import Database from './database';
import { DatabaseInfo, DBType, LoginInfo, QueryParams } from './info';
export default class Sirix {
    constructor();
    init(loginInfo: LoginInfo, sirixUri: string): Promise<void>;
    shutdown(): void;
    private readonly _client;
    database(dbName: string, dbType: DBType): Database;
    getInfo(resources?: boolean): Promise<DatabaseInfo[]>;
    query(query: QueryParams): Promise<any>;
    deleteAll(): Promise<boolean>;
}
