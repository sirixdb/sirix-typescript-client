import {AuthData, LoginInfo} from "./info";
import Axios, {AxiosPromise, AxiosRequestConfig} from "axios";

export type request = (config: AxiosRequestConfig) => AxiosPromise;
export type shutdown = () => void;

interface Auth {
    request: request
    shutdown: shutdown;
}

export function initClient(loginInfo: LoginInfo, sirixUri: string): Promise<Auth> {
    let authData: AuthData;
    let timeout: NodeJS.Timeout | number;

    function getTokenWithCredentials() {
        return Axios.post(`${sirixUri}/token`, {...loginInfo, grant_type: "password"})
            .then(res => {
                if (res.status !== 200) {
                    console.error(res.status, res.data);
                    console.debug("failed to retrieve an access token using credentials. aborting");
                    throw Error("failed to retrieve an access token using credentials");
                }
                authData = res.data as AuthData;
                shutdown();
                timeout = setTimeout(refreshAndSetTimeout, (authData.expires_in - 10) * 1000);
            });
    }

    async function refreshAndSetTimeout() {
        let attempt = 0;
        do {
            var newAuthData = await refreshClient(authData, sirixUri);
            attempt++;
            if (newAuthData === undefined) {
                console.debug(`token refresh (attempt ${attempt}) failed. retrying`);
            }
        } while (newAuthData === undefined && attempt < 3);
        if (newAuthData !== undefined) {
            authData = newAuthData;
            shutdown();
            timeout = setTimeout(refreshAndSetTimeout, (authData.expires_in - 10) * 1000);
        } else {
            console.debug(`token refresh (attempt ${attempt}) failed. attempting to retrieve access token using credentials`);
            await getTokenWithCredentials();
        }
    }

    function refreshClient(authData: AuthData, sirixUri: string): Promise<AuthData | undefined> {
        return Axios.post(`${sirixUri}/token`,
            {refresh_token: authData.refresh_token, grant_type: 'refresh_token'})
            .then(res => {
                if (res.status === 200) {
                    return res.data;
                }
                return undefined;
            })
            .catch(res => {
                console.error(res.status, res.data);
                return undefined;
            });
    }

    function shutdown() {
        clearTimeout(timeout as number);
    }

    function request(config: AxiosRequestConfig) {
        if (typeof config.headers === "object") {
            config.headers = {
                ...config.headers,
                authorization: `${authData.token_type} ${authData.access_token}`
            };
        } else {
            config.headers = {
                authorization: `${authData.token_type} ${authData.access_token}`
            }
        }
        return Axios.request({...config, baseURL: sirixUri});
    }

    return getTokenWithCredentials()
        .then(() => {
            return {request, shutdown};
        })
}
