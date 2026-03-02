let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import Client from "../src/client";
import {initClient} from '../src/auth';
import {token} from "./data";

describe("test authentication", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    test('test auth with credentials, refresh with access token', async () => {
        let sentUrl: string;
        let sentData: string;
        const m = mockedFetch.mockImplementation(async (requestInfo: RequestInfo,
                                                        requestInit: RequestInit): Promise<Response> => {
            sentUrl = requestInfo as string;
            sentData = requestInit.body as string;
            return new Response(JSON.stringify(token), {status: 200});
        });
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "http://localhost:9443");
        expect("http://localhost:9443/token").toMatch(sentUrl);
        expect(sentData).toEqual(JSON.stringify({username: "admin", password: "admin", grant_type: "password"}));
        jest.runOnlyPendingTimers();
        client.shutdown();
        expect(m.mock.calls.length).toEqual(2);
        expect(sentData).toEqual(JSON.stringify({refresh_token: token.refresh_token, grant_type: "refresh_token"}));
    });

    test('auth with credentials failure', async () => {
        mockedFetch.mockResolvedValue(Promise.resolve(
            new Response("invalid credentials", {status: 401})
        ));
        const client = new Client();
        const errorSpy = jest.spyOn(console, 'error');
        const debugSpy = jest.spyOn(console, 'debug');
        try {
            await client.init(
                {username: "admin", password: "admin"},
                "http://localhost:9443");
            // an error should've already been thrown
            expect(true).toEqual(false);
        } catch (e) {
            expect(e.message).toEqual("invalid credentials");
        }
        expect(errorSpy).toHaveBeenCalledWith("401, invalid credentials");
        expect(debugSpy).toHaveBeenCalledWith("failed to retrieve an access token using credentials. aborting");
    });

    test('auth refresh retry', async () => {
        mockedFetch.mockResolvedValue(Promise.resolve(new Response(
            JSON.stringify(token), {status: 200})
        ));
        const debugSpy = jest.spyOn(console, 'debug');
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "http://localhost:9443");
        mockedFetch.mockResolvedValue(Promise.resolve(
            new Response(JSON.stringify({status: 500}))
        ));
        setTimeout(() => {
            expect(debugSpy).toHaveBeenCalledTimes(4);
            expect(mockedFetch.mock).toHaveBeenCalledWith({
                refresh_token: token.refresh_token,
                grant_type: "refresh_token"
            });
        }, 1100);
    });

    test('adds auth header and baseUrl', async () => {
        mockedFetch.mockResolvedValue(Promise.resolve(
            new Response(JSON.stringify(token), {status: 200})
        ));
        const auth = await initClient({username: "admin", password: "admin"},
            "http://localhost:9443");
        mockedFetch.mockClear();
        const mockRequest = mockedFetch.mockResolvedValue(Promise.resolve(
            new Response('{}', {status: 200})
        ));
        const res = await auth.request("/", {method: "GET", headers: {"content-type": "application/json"}});
        expect(await res.json()).toEqual({});
        expect(mockRequest)
            .toHaveBeenCalledWith("http://localhost:9443/", {
                method: "GET",
                headers: {
                    authorization: `${token.token_type} ${token.access_token}`,
                    "content-type": "application/json",
                }
            });
    });

    test('retries refresh 3 times then falls back to credentials', async () => {
        // Behavioral: when token refresh keeps failing, the system retries
        // up to 3 times, then re-authenticates with credentials
        const successResponse = () => new Response(JSON.stringify(token), {status: 200});
        const failResponse = () => new Response(null, {status: 500});

        mockedFetch
            .mockImplementationOnce(async () => successResponse())  // init
            .mockImplementationOnce(async () => failResponse())     // refresh 1
            .mockImplementationOnce(async () => failResponse())     // refresh 2
            .mockImplementationOnce(async () => failResponse())     // refresh 3
            .mockImplementationOnce(async () => successResponse())  // credential fallback
            .mockImplementation(async () => successResponse());     // safe default

        const debugSpy = jest.spyOn(console, 'debug');
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "http://localhost:9443");

        // fire the refresh timer (token.expires_in=11, so (11-10)*1000=1000ms)
        jest.advanceTimersByTime(1000);

        // flush async retry loop
        const realSetTimeout = jest.requireActual<typeof import('timers')>('timers').setTimeout;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => realSetTimeout(resolve, 0));
        }

        client.shutdown();

        expect(debugSpy).toHaveBeenCalledWith(
            "token refresh (attempt 1) failed. retrying");
        expect(debugSpy).toHaveBeenCalledWith(
            "token refresh (attempt 2) failed. retrying");
        expect(debugSpy).toHaveBeenCalledWith(
            "token refresh (attempt 3) failed. attempting to retrieve access token using credentials");
    });

    test('catches network errors during refresh and retries', async () => {
        // Behavioral: when fetch throws (network failure), the error is caught
        // and the refresh is retried, eventually falling back to credentials
        const successResponse = () => new Response(JSON.stringify(token), {status: 200});

        mockedFetch
            .mockImplementationOnce(async () => successResponse())          // init
            .mockImplementationOnce(async () => { throw new Error("net"); })  // refresh 1
            .mockImplementationOnce(async () => { throw new Error("net"); })  // refresh 2
            .mockImplementationOnce(async () => { throw new Error("net"); })  // refresh 3
            .mockImplementationOnce(async () => successResponse())          // credential fallback
            .mockImplementation(async () => successResponse());             // safe default

        const errorSpy = jest.spyOn(console, 'error');
        const debugSpy = jest.spyOn(console, 'debug');
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "http://localhost:9443");

        jest.advanceTimersByTime(1000);

        const realSetTimeout = jest.requireActual<typeof import('timers')>('timers').setTimeout;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => realSetTimeout(resolve, 0));
        }

        client.shutdown();

        // network errors are logged via console.error in the catch block
        expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
        expect(debugSpy).toHaveBeenCalledWith(
            "token refresh (attempt 3) failed. attempting to retrieve access token using credentials");
    });

    test('successful refresh uses the new token for subsequent requests', async () => {
        // Behavioral: after a successful refresh, the client uses the new token
        const refreshedToken = {
            ...token,
            access_token: "refreshed-access-token",
            refresh_token: "refreshed-refresh-token",
        };

        mockedFetch
            .mockImplementationOnce(async () => new Response(JSON.stringify(token), {status: 200}))           // init
            .mockImplementationOnce(async () => new Response(JSON.stringify(refreshedToken), {status: 200}))  // refresh
            .mockImplementation(async () => new Response(JSON.stringify(refreshedToken), {status: 200}));     // safe default

        const auth = await initClient(
            {username: "admin", password: "admin"},
            "http://localhost:9443");

        jest.advanceTimersByTime(1000);
        const realSetTimeout = jest.requireActual<typeof import('timers')>('timers').setTimeout;
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => realSetTimeout(resolve, 0));
        }

        // now make a request — it should use the refreshed token
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo,
                                                   requestInit: RequestInit): Promise<Response> => {
            // @ts-ignore
            expect(requestInit.headers.authorization).toEqual(
                `${refreshedToken.token_type} ${refreshedToken.access_token}`);
            return new Response('{}', {status: 200});
        });

        const res = await auth.request("/test", {method: "GET"});
        expect(await res.json()).toEqual({});
        auth.shutdown();
    });

    test('request appends query params to URL', async () => {
        // Behavioral: verify params are correctly appended to URL
        mockedFetch.mockResolvedValue(Promise.resolve(
            new Response(JSON.stringify(token), {status: 200})
        ));
        const auth = await initClient({username: "admin", password: "admin"},
            "http://localhost:9443");

        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/db/resource?nodeId=5&revision=2");
            return new Response('{}', {status: 200});
        });

        await auth.request("/db/resource", {method: "GET"}, {nodeId: "5", revision: "2"});
        auth.shutdown();
    });

    test('request throws ServerError on non-ok response', async () => {
        // Behavioral: non-ok responses are translated to ServerError
        mockedFetch.mockResolvedValue(Promise.resolve(
            new Response(JSON.stringify(token), {status: 200})
        ));
        const auth = await initClient({username: "admin", password: "admin"},
            "http://localhost:9443");

        mockedFetch.mockImplementationOnce(async (): Promise<Response> => {
            return new Response("resource not found", {status: 404});
        });

        try {
            await auth.request("/missing", {method: "GET"});
            expect(true).toBe(false);
        } catch (e) {
            expect(e.status).toBe(404);
            expect(e.message).toBe("resource not found");
        }
        auth.shutdown();
    });
});
