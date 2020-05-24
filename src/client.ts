import {initClient, request, shutdown} from "./auth";
import {ContentType, DiffParams, LoginInfo, QueryParams, ReadParams, UpdateParams} from "./info";
import {AxiosPromise} from "axios";

export default class Client {
    private _request: request;
    public shutdown: shutdown;

    public init(loginInfo: LoginInfo, sirixUri: string) {
        return initClient(loginInfo, sirixUri)
            .then(({request, shutdown}) => {
                this._request = request;
                this.shutdown = shutdown;
            });
    }

    public globalInfo(resources: boolean = true): AxiosPromise {
        let params = {};
        if (resources) {
            params = {"withResources": true};
        }
        return this._request({method: "GET", url: "/", params});
    }

    public deleteAll(): AxiosPromise {
        return this._request({method: "DELETE", url: "/"});
    }

    public createDatabase(name: string, contentType: ContentType): AxiosPromise {
        return this._request({
            url: `/${name}`,
            method: "PUT",
            headers: {"content-type": contentType}
        })
    }

    public getDatabaseInfo(name: string): AxiosPromise {
        return this._request({
            method: "GET",
            url: `/${name}`, headers: {"accept": ContentType.JSON}
        });
    }

    public deleteDatabase(name: string): AxiosPromise {
        return this._request({method: "DELETE", url: `/${name}`});
    }

    public resourceExists(dbName: string, contentType: ContentType,
                          resource: string): Promise<boolean> {
        return this._request({
            method: "HEAD",
            url: `/${dbName}/${resource}`, headers: {"accept": ContentType}
        })
            .then(() => {
                return true;
            })
            .catch(err => {
                if (err.response.status === 404) {
                    return false;
                } else {
                    console.log(err)
                    throw Error(err);
                }
            });
    }

    public createResource(dbName: string, contentType: ContentType,
                          resource: string, data: string): AxiosPromise {
        return this._request({
            method: "PUT", url: `/${dbName}/${resource}`,
            headers: {"content-type": contentType},
            data
        });
    }

    public readResource(dbName: string, contentType: ContentType,
                        resource: string, params: ReadParams | QueryParams) {
        return this._request({
            method: "GET", url: `/${dbName}/${resource}`,
            params
        });
    }

    public history(dbName: string, contentType: ContentType, resource: string) {
        return this._request({
            method: "GET",
            url: `/${dbName}/${resource}/history`, headers: {"accept": contentType}
        })
            .then(res => {
                return res.data.history;
            });
    }

    public diff(dbName: string, resource: string, params: DiffParams) {
        return this._request({
            method: "GET",
            url: `/${dbName}/${resource}/diff`,
            params
        });
    }

    public postQuery(query: QueryParams) {
        return this._request({url: '/', method: "POST", data: query});
    }

    public getEtag(dbName: string, contentType: ContentType, resource: string,
                   params: ReadParams) {
        return this._request({
            method: "HEAD", url: `/${dbName}/${resource}`,
            params, headers: {"accept": contentType}
        });
    }

    public update(dbName: string, contentType: ContentType, resource: string,
                  updateParams: UpdateParams) {
        return this._request({
            method: "POST",
            url: `/${dbName}/${resource}`,
            params: {nodeId: updateParams.nodeId, insert: updateParams.insert},
            headers: {ETag: updateParams.etag, "content-type": contentType},
            data: updateParams.data
        });
    }

    public resourceDelete(dbName: string, contentType: ContentType, resource: string,
                          nodeId: number | null, ETag: string | null): AxiosPromise {
        if (nodeId) {
            return this._request({
                url: `/${dbName}/${resource}`,
                method: "DELETE",
                params: {nodeId},
                headers: {ETag, "content-type": contentType}
            });
        } else {
            return this._request({
                url: `/${dbName}/${resource}`,
                method: "DELETE",
            })
        }
    }
}
