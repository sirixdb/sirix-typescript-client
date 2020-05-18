import Database from './database';
import { DatabaseInfo, DBType, LoginInfo } from './info';
export default class Sirix {
    constructor();
    init(loginInfo: LoginInfo, sirixUri: string): Promise<void>;
    private readonly _client;
    database(dbName: string, dbType: DBType): Database;
    getInfo(resources: boolean): Promise<DatabaseInfo[]>;
    query(query: string, startResultSeqIndex: number | undefined, endResultSeqIndex: number | undefined): import("axios").AxiosPromise<any>;
    deleteAll(): Promise<boolean>;
}
