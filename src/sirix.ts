import Axios from 'axios';

import Client from "./client";
import Database from './database'

import {DatabaseInfo, DBType, LoginInfo, StringMap} from './info'

function sirixInit(loginInfo: LoginInfo, sirixUri: string): Promise<Sirix> {
    const sirix = new Sirix();
    return sirix.init(loginInfo, sirixUri)
        .then(() => {
            return sirix;
        });
}

export default class Sirix {
    /**
     * This class is the entrypoint to interacting with a SirixDB server.
     * It interacts with the root level of the server, and provides
     * an API to access the Database class
     *
     * @remarks
     * If instantiating this class directly, the `init` method must be called.
     * the `sirixInit` function does this for you.
     */
    constructor() {
        this._client = new Client();
    }

    /**
     * init
     *
     */
    public init(loginInfo: LoginInfo, sirixUri: string): Promise<void> {
        return this._client.init(loginInfo, sirixUri);
    }

    private readonly _client: Client;

    /**
     * database
     */
    public database(dbName: string, dbType: DBType): Database {
        return new Database(dbName, dbType, this._client);
    }

    /**
     * getInfo
     */
    public getInfo(resources: boolean): Promise<DatabaseInfo[]> {
        return this._client.globalInfo(resources)
            .then(res => {
                return res.data.databases as DatabaseInfo[];
            });
    }

    /**
     * query
     */
    public query(query: string, startResultSeqIndex: number | undefined,
                 endResultSeqIndex: number | undefined) {
        const queryObj: StringMap = {query, startResultSeqIndex, endResultSeqIndex};
        Object.keys(queryObj).forEach(param => {
            if (param === undefined) {
                delete queryObj[param];
            }
        });
        return this._client.postQuery(
            queryObj as unknown as Map<string, string | number>);
    }

    /**
     * delete
     */
    public deleteAll(): Promise<boolean> {
        return this._client.deleteAll()
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }
}