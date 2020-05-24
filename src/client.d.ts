import { shutdown } from "./auth";
import { ContentType, DiffParams, LoginInfo, QueryParams, ReadParams, UpdateParams } from "./info";
import { AxiosPromise } from "axios";
export default class Client {
    private _request;
    shutdown: shutdown;
    init(loginInfo: LoginInfo, sirixUri: string): Promise<void>;
    globalInfo(resources?: boolean): AxiosPromise;
    deleteAll(): AxiosPromise;
    createDatabase(name: string, contentType: ContentType): AxiosPromise;
    getDatabaseInfo(name: string): AxiosPromise;
    deleteDatabase(name: string): AxiosPromise;
    resourceExists(dbName: string, contentType: ContentType, resource: string): Promise<boolean>;
    createResource(dbName: string, contentType: ContentType, resource: string, data: string): AxiosPromise;
    readResource(dbName: string, contentType: ContentType, resource: string, params: ReadParams | QueryParams): AxiosPromise<any>;
    history(dbName: string, contentType: ContentType, resource: string): Promise<any>;
    diff(dbName: string, resource: string, params: DiffParams): AxiosPromise<any>;
    postQuery(query: QueryParams): AxiosPromise<any>;
    getEtag(dbName: string, contentType: ContentType, resource: string, params: ReadParams): AxiosPromise<any>;
    update(dbName: string, contentType: ContentType, resource: string, updateParams: UpdateParams): AxiosPromise<any>;
    resourceDelete(dbName: string, contentType: ContentType, resource: string, nodeId: number | null, ETag: string | null): AxiosPromise;
}
