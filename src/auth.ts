import {AuthData, LoginInfo, Params} from "./info";
import fetchPonyfill from "fetch-ponyfill";

const {fetch} = fetchPonyfill();

export type request = (urlString: string, requestInit: RequestInit, params?: Params) => Promise<Response>;
export type shutdown = () => void;

interface Auth {
    request: request
    shutdown: shutdown;
}

export function initClient(loginInfo: LoginInfo, sirixUri: string): Promise<Auth> {
    let authData: AuthData;
    let timeout: NodeJS.Timeout | number;

    function getTokenWithCredentials() {
        return fetch(`${sirixUri}/token`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({...loginInfo, grant_type: "password"})
        })
            .then(res => {
                if (!res.ok) {
                    res.text()
                        .then(text => {
                            console.error(res.status, text);
                            console.debug("failed to retrieve an access token using credentials. aborting");
                            throw Error("failed to retrieve an access token using credentials");
                        });
                } else {
                    return res.json().then(data => {
                        authData = data as AuthData;
                        shutdown();
                        timeout = setTimeout(refreshAndSetTimeout, (authData.expires_in - 10) * 1000);
                    });
                }
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
        return fetch(`${sirixUri}/token`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({refresh_token: authData.refresh_token, grant_type: 'refresh_token'})
        }).then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                return undefined;
            })
            .catch(err => {
                console.error(err);
                return undefined;
            });
    }

    function shutdown() {
        clearTimeout(timeout as number);
    }

    function request(urlString: string, requestInit: RequestInit, params: Params = {}) {
        if (typeof requestInit.headers === "object") {
            requestInit.headers = {
                ...requestInit.headers,
                authorization: `${authData.token_type} ${authData.access_token}`
            };
        } else {
            requestInit.headers = {
                authorization: `${authData.token_type} ${authData.access_token}`
            }
        }
        const url = new URL(urlString, sirixUri)
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return fetch(url.toString(), requestInit).then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    throw new Error(text);
                });
            }
            return res;
        });
    }

    return getTokenWithCredentials()
        .then(() => {
            return {request, shutdown};
        })
}
