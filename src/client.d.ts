import Auth from './auth';
import Database from './database';
import { DatabaseInfo } from './info';
export default class Sirix {
    constructor(username: string, password: string, sirixUri: string, callback: Function);
    auth: Auth;
    private sirixInfo;
    private authData;
    database(db_name: string, db_type?: string): Promise<Database>;
    getInfo(): Promise<DatabaseInfo[]>;
    delete(): Promise<boolean>;
}
