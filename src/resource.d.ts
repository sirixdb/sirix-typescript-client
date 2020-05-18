import { AxiosPromise, AxiosResponse } from "axios";
import { Commit, ContentType, DBType, DiffResponse, MetaNode, Revision, UpdateParams } from './info';
import Client from "./client";
export default class Resource {
    readonly dbName: string;
    readonly name: string;
    readonly dbType: DBType;
    private readonly contentType;
    private readonly _client;
    constructor(dbName: string, name: string, dbType: DBType, contentType: ContentType, _client: Client);
    create(data: string): AxiosPromise;
    exists(): Promise<boolean>;
    read(inputParams: {
        nodeId?: number;
        revision?: Revision | [Revision, Revision];
        maxLevel?: number;
    }): Promise<string | JSON>;
    readWithMetadata(inputParams: {
        nodeId?: number;
        revision?: Revision | [Revision, Revision];
        maxLevel?: number;
    }): Promise<MetaNode>;
    private static _readParams;
    history(): Promise<Commit[]>;
    diff(firstRevision: Revision, secondRevision: Revision, inputParams: {
        nodeId?: number;
        maxLevel?: number;
    }): Promise<DiffResponse>;
    getEtag(nodeId: number): Promise<string>;
    update(updateParams: UpdateParams): Promise<AxiosResponse>;
    delete(nodeId: number | null, ETag: string | null): Promise<AxiosResponse>;
}
