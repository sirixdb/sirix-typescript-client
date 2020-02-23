import { Insert } from './utils';
import { SirixInfo, AuthData, Revision, Commit, MetaNode, DiffResponse } from './info';
export default class Resource {
    private dbName;
    private resourceName;
    private type;
    private sirixInfo;
    private authData;
    constructor(dbName: string, resourceName: string, type: string, sirixInfo: SirixInfo, authData: AuthData);
    create(data: string): Promise<boolean>;
    history(): Promise<Commit[]>;
    diff(firstRevision: Revision, secondRevision: Revision, inputParams: {
        nodeId?: number;
        maxLevel?: number;
    }): Promise<DiffResponse>;
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
    private readParams;
    updateById(nodeId: number, data: string, insert: Insert): Promise<boolean>;
    update(nodeId: number, ETag: string, data: string, insert: Insert): Promise<boolean>;
    deleteById(nodeId: number | null): Promise<boolean>;
    delete(nodeId: number | null, ETag: number): Promise<boolean>;
}
