import { SirixInfo, AuthData, DatabaseInfo } from './info';
import Resource from './resource';
export default class Database {
    private name;
    private type;
    private sirixInfo;
    private authData;
    constructor(name: string, type: string, sirixInfo: SirixInfo, authData: AuthData);
    ready(): Promise<boolean>;
    delete(): Promise<boolean>;
    resource(name: string): Resource;
    getInfo(withResources?: boolean): Promise<DatabaseInfo[]>;
    private create;
}
