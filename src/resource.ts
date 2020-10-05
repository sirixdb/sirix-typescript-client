import {Insert} from './constants';

import {
    Commit,
    ContentType,
    DBType,
    DiffParams,
    DiffResponse, EventCallbacks,
    MetaNode,
    MetaType,
    QueryParams,
    ReadParams,
    Revision,
    UpdateParams
} from './info';
import Client from "./client";

import {DOMParser} from "xmldom";

const domParser = new DOMParser();

export default class Resource {
    constructor(
        public readonly dbName: string,
        public readonly name: string,
        public readonly dbType: DBType,
        private readonly contentType: ContentType,
        private readonly _client: Client
    ) {
    }

    /**
     * create
     */
    public create(data: string): Promise<Response> {
        return this._client.createResource(this.dbName,
            this.contentType, this.name, data);
    }

    public createBrowser(data: string, eventCallbacks: EventCallbacks) {
        return this._client.createResourceBrowser(this.dbName, this.contentType, this.name, data, eventCallbacks);
    }

    public exists(): Promise<boolean> {
        return this._client.resourceExists(this.dbName,
            this.contentType, this.name);
    }

    /**
     * read
     */
    public read(inputParams: {
        nodeId?: number,
        revision?: Revision | [Revision, Revision],
        maxLevel?: number,
        nextTopLevelNodes?: number,
        lastTopLevelNodeKey?: number
    } | undefined): Promise<JSON | Document> {
        const params = Resource._readParams(inputParams || {});
        return this._client.readResource(this.dbName, this.contentType,
            this.name, {...params, prettyPrint: false})
            .then(res => {
                if (this.dbType === DBType.JSON) {
                    return res.json();
                } else {
                    return res.text()
                        .then(text => {
                            return domParser.parseFromString(text, "application/xml");
                        })
                }
            });
    }

    /**
     * readWithMetadata
     */
    public readWithMetadata(inputParams: {
        nodeId?: number,
        revision?: Revision | [Revision, Revision],
        maxLevel?: number,
        metaType?: MetaType,
        nextTopLevelNodes?: number,
        lastTopLevelNodeKey?: number
    }): Promise<MetaNode> {
        const params = Resource._readParams({
            ...inputParams,
            metaType: inputParams.metaType ? inputParams.metaType : MetaType.ALL
        });
        return this._client.readResource(this.dbName, this.contentType,
            this.name, params)
            .then(res => {
                return res.json();
            });
    }

    private static _readParams(inputParams: {
        nodeId?: number,
        revision?: Revision | [Revision, Revision],
        maxLevel?: number,
        metaType?: MetaType,
        nextTopLevelNodes?: number,
        lastTopLevelNodeKey?: number
    }): ReadParams {
        let {nodeId, revision, maxLevel, metaType, nextTopLevelNodes, lastTopLevelNodeKey} = inputParams;
        let params: ReadParams = {
            ...(nodeId && {nodeId}),
            ...(maxLevel && {maxLevel}),
            ...(nextTopLevelNodes && {nextTopLevelNodes}),
            ...(lastTopLevelNodeKey && {lastTopLevelNodeKey})
        };
        if (revision) {
            if (typeof revision === 'number') {
                params['revision'] = revision;
            } else if (revision instanceof Date) {
                params['revision-timestamp'] = revision.toISOString();
            } else if (typeof revision[0] === 'number' && typeof revision[1] === 'number') {
                params['start-revision'] = revision[0];
                params['end-revision'] = revision[1];
            } else if (revision[0] instanceof Date && revision[1] instanceof Date) {
                params['start-revision-timestamp'] = revision[0].toISOString();
                params['end-revision-timestamp'] = revision[1].toISOString();
            }
        }
        if (metaType) {
            params.withMetadata = metaType;
        }
        return params;
    }

    /**
     * history
     */
    public history(): Promise<Commit[]> {
        return this._client.history(this.dbName, this.contentType, this.name);
    }

    /**
     * diff
     */
    public diff(firstRevision: Revision, secondRevision: Revision, inputParams?: {
        nodeId?: number,
        maxLevel?: number
    }): Promise<DiffResponse> {
        let params: DiffParams = {}
        if (inputParams) {
            if (inputParams.nodeId) {
                params.startNodeKey = inputParams.nodeId;
            }
            if (inputParams.maxLevel) {
                params.maxDepth = inputParams.maxLevel;
            }
        }
        if (typeof firstRevision === "number" && typeof secondRevision === "number") {
            params["first-revision"] = firstRevision;
            params["second-revision"] = secondRevision;
        } else if (firstRevision instanceof Date && secondRevision instanceof Date) {
            params["first-revision"] = firstRevision.toISOString();
            params["second-revision"] = secondRevision.toISOString();
        }
        return this._client.diff(this.dbName, this.name, params)
            .then(res => {
                return res.json();
            });
    }

    public getEtag(nodeId: number): Promise<string | undefined> {
        return this._client.getEtag(this.dbName, this.contentType, this.name,
            {nodeId})
            .then(res => {
                const etag = res.headers.get("etag");
                if (etag) {
                    return etag;
                } else {
                    return undefined;
                }
            });
    }

    /**
     * update
     */
    public async update(updateParams: UpdateParams): Promise<Response> {
        if (updateParams.insert === undefined) {
            updateParams.insert = Insert.CHILD;
        }
        if (updateParams.etag == undefined) {
            updateParams.etag = await this.getEtag(updateParams.nodeId)
        }
        return this._client.update(this.dbName, this.contentType,
            this.name, updateParams);
    }

    /**
     * query
     */
    public query(queryParams: QueryParams) {
        return this._client.readResource(this.dbName, this.contentType, this.name,
            queryParams)
            .then(res => {
                return res.json();
            });
    }

    /**
     * delete
     */
    public async delete(nodeId: number | null, ETag: string | null): Promise<Response> {
        if (!ETag && nodeId) {
            ETag = await this.getEtag(nodeId);
        }
        return this._client.resourceDelete(this.dbName, this.contentType,
            this.name, nodeId, ETag);
    }
}
