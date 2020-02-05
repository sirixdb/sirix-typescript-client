import { SirixInfo, LoginInfo, AuthData } from './info';
export default class Auth {
    private loginInfo;
    private sirixInfo;
    private authData;
    constructor(loginInfo: LoginInfo, sirixInfo: SirixInfo, authData: AuthData);
    private authenticate;
    private setRefreshTimeout;
    private refresh;
}
