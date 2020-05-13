import Auth from './auth';
import Database from './database';
import { SirixInfo, DatabaseInfo } from './info';
export default class Sirix {
    constructor();
    auth: Auth;
    sirixInfo: SirixInfo;
    private authData;
    authenticate(username: string, password: string, sirixUri: string, callback: Function): void;
    database(db_name: string, db_type?: string): Promise<Database>;
    getInfo(): Promise<DatabaseInfo[]>;
    delete(): Promise<boolean>;
}
