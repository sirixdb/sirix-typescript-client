import Axios, {AxiosPromise, AxiosRequestConfig} from "axios";
import {AuthData, LoginInfo} from "./info";

export default class Client {
    private _client: request;
    private shutdown: shutdown;

    public async init(loginInfo: LoginInfo, sirixUri: string) {
        initClient(loginInfo, sirixUri)
            .then(client => {
                this._client = client.request;
                this.shutdown = client.shutdown;
            })
    }
}

function initClient(loginInfo: LoginInfo, sirixUri: string): Promise<Auth> {
    let authData: AuthData;
    let timeout: NodeJS.Timeout | number;

    async function getTokenWithCredentials() {
        Axios.post(`${sirixUri}/token`, loginInfo)
            .then(res => {
                if (res.status !== 200) {
                    console.error("failed to retrieve an access token using credentials. aborting");
                } else {
                    authData = res.data as AuthData;
                    timeout = setTimeout(refreshAndSetTimeout, (authData.expires_in - 10) * 1000);
                }
            })
    }

    function refreshAndSetTimeout(repetition = 0) {
        refreshClient(authData, sirixUri)
            .then(newAuthData => {
                if (newAuthData !== undefined) {
                    authData = newAuthData;
                    timeout = setTimeout(refreshAndSetTimeout, (authData.expires_in - 10) * 1000);
                } else {
                    console.debug(`token refresh (attempt ${repetition + 1}) failed. retrying`);
                    if (repetition < 3) {
                        refreshAndSetTimeout(repetition + 1);
                    }
                    getTokenWithCredentials();
                }
            });
    }

    function shutdown() {
        if (typeof timeout !== "number") {
            clearTimeout(timeout)
        } else {
            clearTimeout(timeout)
        }
    }

    function request(config: AxiosRequestConfig) {
        config.headers = {
            ...config.headers,
            authorization: authData.access_token
        };
        return Axios(config);
    }

    return getTokenWithCredentials()
        .then(() => {
            return {request, shutdown};
        })
}

type request = (config: AxiosRequestConfig) => AxiosPromise;
type shutdown = () => void;

interface Auth {
    request: request
    shutdown: shutdown;
}


function refreshClient(authData: AuthData, sirixUri: string): Promise<AuthData | undefined> {
    return Axios.post(`${sirixUri}/token`,
        {refresh_token: authData.refresh_token, grant_type: 'refresh_token'})
        .then(res => {
            if (res.status !== 200) {
                console.error(res.status, res.data);
                return undefined;
            }
            return res.data;
        })
        .catch(res => {
            console.debug(res);
            return undefined;
        });
}
