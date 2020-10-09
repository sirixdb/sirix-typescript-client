import {mocked} from "ts-jest/utils";

let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = mocked(mockedFetch, true);

import Client from "../src/client";
import {initClient} from '../src/auth';
import {token} from "./data";

describe("test authentication", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
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
            expect(e.message).toEqual("failed to retrieve an access token using credentials");
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
});
