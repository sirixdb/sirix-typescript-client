import { SirixInfo, LoginInfo, AuthData } from './info';
export default class Auth {
    private loginInfo;
    private sirixInfo;
    private authData;
    callback: Function;
    constructor(loginInfo: LoginInfo, sirixInfo: SirixInfo, authData: AuthData, callback: Function);
    authenticate(): Promise<void>;
    private setRefreshTimeout;
    private refresh;
}
