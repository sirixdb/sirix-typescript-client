import {AxiosPromise} from 'axios';

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
    public create(): AxiosPromise {
        return this._client.createDatabase(this.name, this.contentType);
    }

    /**
     * resource
     */
    public resource(name: string): Resource {
        return null;
    }

    /**
     * getInfo
     */
    public getInfo(withResources = false): Promise<DatabaseInfo> {
        let params = {withResources};
        if (!withResources) {
            delete params.withResources;
        }
        return this._client.getDatabaseInfo(this.name)
            .then(res => {
                return res.data;
            });
    }

    /**
     * delete
     */
    public delete(): AxiosPromise {
        return this._client.deleteDatabase(this.name);
    }
}