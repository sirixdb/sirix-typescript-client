import { SirixInfo, AuthData, DatabaseInfo } from './info';
export default class Database {
    private name;
    private type;
    private sirixInfo;
    private authData;
    constructor(name: string, type: string, sirixInfo: SirixInfo, authData: AuthData);
    ready(): Promise<boolean>;
    delete(): Promise<boolean>;
    resource(): void;
    getInfo(): Promise<DatabaseInfo>;
    private create;
}
