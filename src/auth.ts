import {AuthData, ContentType, LoginInfo, Params} from "./info";
import fetchPonyfill from "fetch-ponyfill";
import {ServerError} from "./constants";

const {fetch} = fetchPonyfill();

export type request = (urlString: string, requestInit: RequestInit, params?: Params) => Promise<Response>;
export type shutdown = () => void;
export type EventCallback = (ev: Event) => any;
export type BrowserUploadRequest = (
    urlString: string,
    contentType: ContentType,
    body: string,
    uploadProgressCallback: EventCallback,
    loadCallback: EventCallback,
    errorCallback: EventCallback) => void;

interface Auth {
    request: request
    shutdown: shutdown;
    browserUploadRequest: BrowserUploadRequest;
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
            .then(async res => {
                if (!res.ok) {
                    await res.text()
                        .then(text => {
                            console.error(`${res.status}, ${text}`);
                            console.debug("failed to retrieve an access token using credentials. aborting");
                            throw new ServerError(res.status, text);
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
        requestInit.headers = {
            ...requestInit.headers,
            authorization: `${authData.token_type} ${authData.access_token}`
        };
        const url = new URL(urlString, sirixUri);
        for (const key of Object.keys(params)) {
            url.searchParams.append(key, params[key]);
        }
        return fetch(url.toString(), requestInit).then(async res => {
            if (!res.ok) {
                await res.text().then(text => {
                    throw new ServerError(res.status, text)
                });
            }
            return res;
        });
    }

    function browserUploadRequest(
        urlString: string,
        contentType: ContentType,
        body: string,
        uploadProgressCallback: EventCallback,
        loadCallback: EventCallback,
        errorCallback: EventCallback,
    ) {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", new URL(urlString, sirixUri).toString(), true);
        xhr.setRequestHeader('content-type', contentType);
        xhr.setRequestHeader('authorization', `${authData.token_type} ${authData.access_token}`);
        xhr.onerror = errorCallback;
        xhr.onload = loadCallback;
        xhr.upload.onprogress = uploadProgressCallback;
        xhr.send(body);
    }

    return getTokenWithCredentials()
        .then(() => {
            return {request, shutdown, browserUploadRequest};
        })
}
