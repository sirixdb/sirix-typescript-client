import {ContentType, DatabaseInfo, DBType} from './info'

import Resource from './resource';
import Client from "./client";

export default class Database {
    constructor(public readonly name: string,
                public readonly dbType: DBType,
                private readonly _client: Client) {
        if (dbType === DBType.JSON) {
            this.contentType = ContentType.JSON;
        } else {
            this.contentType = ContentType.XML;
        }
    }

    private readonly contentType: ContentType;

    /**
     * create
     */
    public create(): Promise<Response> {
        return this._client.createDatabase(this.name, this.contentType);
    }

    /**
     * resource
     */
    public resource(name: string): Resource {
        return new Resource(this.name, name, this.dbType, this.contentType,
            this._client);
    }

    /**
     * getInfo
     */
    public getInfo(): Promise<DatabaseInfo> {
        return this._client.getDatabaseInfo(this.name)
            .then(res => {
                return res.json();
            });
    }

    /**
     * delete
     */
    public delete(): Promise<Response> {
        return this._client.deleteDatabase(this.name);
    }
}