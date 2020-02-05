import { Insert } from './utils';
import Database from "./database";
import { SirixInfo, AuthData, Revision } from './info';
export default class Resource {
    private dbName;
    private resourceName;
    private type;
    private sirixInfo;
    private authData;
    private parent;
    constructor(dbName: string, resourceName: string, type: string, sirixInfo: SirixInfo, authData: AuthData, parent: Database);
    private exists;
    private create;
    read(nodeId: number | null, revision: Revision | [Revision, Revision] | null, maxLevel?: number | null, withMetadata?: boolean): Promise<string>;
    updateById(nodeId: number, data: string, insert: Insert): Promise<boolean>;
    update(nodeId: number, ETag: string, data: string, insert: Insert): Promise<boolean>;
    delete(nodeId: number | null): Promise<boolean>;
}
