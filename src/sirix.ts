import Client from "./client";
import Database from './database'

import {DatabaseInfo, DBType, LoginInfo, QueryParams} from './info'

export function sirixInit(sirixUri: string, loginInfo: LoginInfo): Promise<Sirix> {
    const sirix = new Sirix();
    return sirix.init(loginInfo, sirixUri)
        .then(() => {
            return sirix;
        });
}

export class Sirix {
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

    public shutdown() {
        this._client.shutdown()
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
    public getInfo(resources: boolean = true): Promise<DatabaseInfo[]> {
        return this._client.globalInfo(resources)
            .then(res => {
                return res.json()
                    .then(data => {
                        return data.databases as DatabaseInfo[]
                    });
            });
    }

    /**
     * query
     */
    public query(query: QueryParams) {
        return this._client.postQuery(query)
            .then(res => {
                return res.text();
            });
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