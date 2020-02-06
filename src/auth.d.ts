import { SirixInfo, LoginInfo, AuthData } from './info';
export default class Auth {
    private loginInfo;
    private sirixInfo;
    private authData;
    callback: Function;
    constructor(loginInfo: LoginInfo, sirixInfo: SirixInfo, authData: AuthData, callback: Function);
    private timeout;
    private _ready;
    ready(): Promise<boolean>;
    authenticate(): Promise<boolean>;
    private setRefreshTimeout;
    destroy(): void;
    private refresh;
}
