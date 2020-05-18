import { AxiosPromise } from 'axios';
import { DatabaseInfo, DBType } from './info';
import Resource from './resource';
import Client from "./client";
export default class Database {
    readonly name: string;
    readonly dbType: DBType;
    private readonly _client;
    constructor(name: string, dbType: DBType, _client: Client);
    private readonly contentType;
    create(): AxiosPromise;
    resource(name: string): Resource;
    getInfo(withResources?: boolean): Promise<DatabaseInfo>;
    delete(): AxiosPromise;
}
