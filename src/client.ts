import {initClient, request, shutdown} from "./auth";
import {Commit, ContentType, DiffParams, LoginInfo, Params, QueryParams, ReadParams, UpdateParams} from "./info";

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

    public globalInfo(resources: boolean = true): Promise<Response> {
        let params = {};
        if (resources) {
            params = {"withResources": true};
        }
        return this._request("/", {method: "GET"}, params);
    }

    public deleteAll(): Promise<Response> {
        return this._request("/", {method: "DELETE"});
    }

    public createDatabase(name: string, contentType: ContentType): Promise<Response> {
        return this._request(`/${name}`, {
            method: "PUT",
            headers: {"content-type": contentType}
        })
    }

    public getDatabaseInfo(name: string): Promise<Response> {
        return this._request(`/${name}`, {
            method: "GET",
            headers: {"accept": ContentType.JSON}
        });
    }

    public deleteDatabase(name: string): Promise<Response> {
        return this._request(`/${name}`, {method: "DELETE"});
    }

    public resourceExists(dbName: string, contentType: ContentType,
                          resource: string): Promise<boolean> {
        return this._request(`/${dbName}/${resource}`, {
            method: "HEAD",
            headers: {"accept": contentType}
        })
            .then(res => {
                return res.ok;
            });
    }

    public createResource(dbName: string, contentType: ContentType,
                          resource: string, body: string): Promise<Response> {
        return this._request(`/${dbName}/${resource}`, {
            method: "PUT",
            headers: {"content-type": contentType},
            body
        });
    }

    public readResource(dbName: string, contentType: ContentType,
                        resource: string, params: ReadParams | QueryParams): Promise<Response> {
        return this._request(`/${dbName}/${resource}`, {
            method: "GET",
            headers: {"accept": contentType},
        }, params as Params);
    }

    public history(dbName: string, contentType: ContentType, resource: string): Promise<Commit[]> {
        return this._request(`/${dbName}/${resource}/history`, {
            method: "GET",
            headers: {"accept": contentType}
        })
            .then(res => {
                return res.json().then(data => {
                    return data.history
                });
            });
    }

    public diff(dbName: string, resource: string, params: DiffParams): Promise<Response> {
        return this._request(`/${dbName}/${resource}/diff`, {
            method: "GET",
        }, params as Params);
    }

    public postQuery(query: QueryParams): Promise<Response> {
        return this._request('/', {method: "POST", body: JSON.stringify(query)});
    }

    public getEtag(dbName: string, contentType: ContentType, resource: string,
                   params: ReadParams) {
        return this._request(`/${dbName}/${resource}`, {
            method: "HEAD",
            headers: {"accept": contentType}
        }, params as Params);
    }

    public update(dbName: string, contentType: ContentType, resource: string,
                  updateParams: UpdateParams): Promise<Response> {
        return this._request(`/${dbName}/${resource}`, {
            method: "POST",
            headers: {ETag: updateParams.etag, "content-type": contentType},
            body: updateParams.data
        }, {nodeId: updateParams.nodeId.toString(), insert: updateParams.insert});
    }

    public resourceDelete(dbName: string, contentType: ContentType, resource: string,
                          nodeId: number | null, ETag: string | null): Promise<Response> {
        if (nodeId) {
            return this._request(`/${dbName}/${resource}`, {
                method: "DELETE",
                headers: {ETag, "content-type": contentType}
            }, {nodeId: nodeId.toString()});
        } else {
            return this._request(`/${dbName}/${resource}`, {
                method: "DELETE",
            });
        }
    }
}
