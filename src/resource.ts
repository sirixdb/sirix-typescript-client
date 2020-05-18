import {AxiosPromise, AxiosResponse} from "axios";

import {contentType, Insert} from './constants';

import {
    Commit,
    ContentType,
    DBType,
    DiffParams,
    DiffResponse,
    MetaNode, QueryParams,
    ReadParams,
    Revision,
    UpdateParams
} from './info'
import Client from "./client";

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
    public create(data: string): AxiosPromise {
        return this._client.createResource(this.dbName,
            this.contentType, this.name, data);
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
        maxLevel?: number
    }): Promise<string | JSON> {
        const params = Resource._readParams(inputParams);
        return this._client.readResource(this.dbName, this.contentType,
            this.name, params)
            .then(res => {
                return res.data;
            });
    }

    /**
     * readWithMetadata
     */
    public readWithMetadata(inputParams: {
        nodeId?: number,
        revision?: Revision | [Revision, Revision],
        maxLevel?: number
    }): Promise<MetaNode> {
        const params = Resource._readParams(inputParams);
        params["withMetadata"] = true;
        return this._client.readResource(this.dbName, this.contentType,
            this.name, params)
            .then(res => {
                return res.data;
            });
    }

    private static _readParams(inputParams: {
        nodeId?: number,
        revision?: Revision | [Revision, Revision],
        maxLevel?: number
    }): ReadParams {
        let {nodeId, revision, maxLevel} = {...inputParams};
        let params: ReadParams = {}
        if (nodeId) {
            params['nodeId'] = nodeId;
        }
        if (maxLevel) {
            params['maxLevel'] = maxLevel;
        }
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
    public diff(firstRevision: Revision, secondRevision: Revision, inputParams: {
        nodeId?: number,
        maxLevel?: number
    }): Promise<DiffResponse> {
        let params: DiffParams = {}
        if (inputParams.nodeId) {
            params.startNodeKey = inputParams.nodeId;
        }
        if (inputParams.maxLevel) {
            params.maxDepth = inputParams.maxLevel;
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
                return res.data;
            });
    }

    public getEtag(nodeId: number): Promise<string> {
        return this._client.getEtag(this.dbName, this.contentType, this.name,
            {nodeId})
            .then(res => {
                return res.headers.etag as string;
            });
    }

    /**
     * update
     */
    public async update(updateParams: UpdateParams): Promise<AxiosResponse> {
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
    public query(queryParams: QueryParams): Promise<string> {
        return this._client.readResource(this.dbName, this.contentType, this.name,
            queryParams)
            .then(res => {
                return res.data;
            });
    }

    /**
     * delete
     */
    public async delete(nodeId: number | null, ETag: string | null): Promise<AxiosResponse> {
        if (!ETag && nodeId) {
            ETag = await this.getEtag(nodeId);
        }
        return this._client.resourceDelete(this.dbName, this.contentType,
            this.name, nodeId, ETag);
    }
}