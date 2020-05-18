import {mocked} from 'ts-jest/utils';

jest.mock('axios');
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import Client from "../src/client";
import {initClient} from '../src/auth'

let token = {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJCU0Q2b0xMdkIzUDdYWmNZQzVBUE5TUHQ0VGJCNURDbnF2UmViOF9XODM4In0.eyJqdGkiOiJlNWUxODhhMC03NjY4LTQwN2UtOGViMy03Njc0MDkxMGVhNzYiLCJleHAiOjE1ODkzMjk0MDAsIm5iZiI6MCwiaWF0IjoxNTg5MzI5MTAwLCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6ODA4MC9hdXRoL3JlYWxtcy9zaXJpeGRiIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjIwNjIyOTQwLTE4ODMtNGYwMC1iN2ZlLTAxNjAzZTZmZmZkNyIsInR5cCI6IkJlYXJlciIsImF6cCI6InNpcml4IiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2EwMGEyMzEtNzlmNy00MDUwLWI0ODYtYWQ3M2FhMjcwYzE1IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJtb2RpZnkiLCJ2aWV3Iiwib2ZmbGluZV9hY2Nlc3MiLCJjcmVhdGUiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlbGV0ZSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.MQLlTHHcU1WboWUzC3qKmdhw1Hvr1pJUePIzPGV7agSBC_WCcUZIXzjZKfU5A9oejQSQthYAzxEwsrIjMhU6vMS9uR9jYSl82ES9GF7hpsuXWM7yvkpNHHYWk0YdWoIi9QdJ__JiZm7LZJntZWPCQS8j0XChjTyc2eizDRlPT5R_8FpPkLDd4qy73QtvbrBzFS5XyRzINYegsU4ZJ-R49BMOfDncEOVYcXd4O4cpJdLRVEV5-s6YA_Yi2-xqO1hT4nECN3lO8-5D2JGRSCjCpcr047QLVZ5e3oLbCGVPuyokNUjhZ46rkdLMgN9UJnbBdcraEUPWvO-tmUPODEu5Vw",
    "expires_in": 11,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0MjNlNTNmOC01MTIzLTRjZmItYjI3Yi1lMTBlZTQ0YzRmMTcifQ.eyJqdGkiOiJmNmNiZjk1Ny00YTE0LTQ3MGUtYmVmNC1lMTNiOTM1MmRmYjEiLCJleHAiOjE1ODkzMzA5MDAsIm5iZiI6MCwiaWF0IjoxNTg5MzI5MTAwLCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6ODA4MC9hdXRoL3JlYWxtcy9zaXJpeGRiIiwiYXVkIjoiaHR0cDovL2tleWNsb2FrOjgwODAvYXV0aC9yZWFsbXMvc2lyaXhkYiIsInN1YiI6IjIwNjIyOTQwLTE4ODMtNGYwMC1iN2ZlLTAxNjAzZTZmZmZkNyIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJzaXJpeCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImNhMDBhMjMxLTc5ZjctNDA1MC1iNDg2LWFkNzNhYTI3MGMxNSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJtb2RpZnkiLCJ2aWV3Iiwib2ZmbGluZV9hY2Nlc3MiLCJjcmVhdGUiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlbGV0ZSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCJ9.BFOkRuJP892N3FmppNJLqJz0ziEjZvUXymJos9RKUT8",
    "token_type": "bearer",
    "not-before-policy": 0,
    "session_state": "ca00a231-79f7-4050-b486-ad73aa270c15",
    "scope": "profile email",
    "expires_at": 1589329400037
};

const mockedAxios = mocked(axios, true);


describe("test authentication", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('test auth with credentials, refresh with access token', async () => {
        let sentUrl: string;
        let sentData: Map<string, string>;
        const m = mockedAxios.post.mockImplementation((url: string, data?: any, config?: AxiosRequestConfig) => {
            sentUrl = url;
            sentData = data;
            return Promise.resolve({status: 200, data: token});
        });
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "https://localhost:9443");
        expect("https://localhost:9443/token").toMatch(sentUrl);
        expect({username: "admin", password: "admin", grant_type: "password"}).toEqual(sentData);
        jest.runOnlyPendingTimers();
        client.shutdown();
        expect(m.mock.calls.length).toEqual(2);
        expect(sentData).toEqual({refresh_token: token.refresh_token, grant_type: "refresh_token"});
    });

    test('auth with credentials failure', async () => {
        mockedAxios.post.mockResolvedValue(Promise.resolve({status: 401, data: "invalid credentials"}));
        const client = new Client();
        const errorSpy = jest.spyOn(console, 'error');
        const debugSpy = jest.spyOn(console, 'debug');
        try {
            await client.init(
                {username: "admin", password: "admin"},
                "https://localhost:9443");
        } catch (e) {
            expect(e.message).toEqual("failed to retrieve an access token using credentials");
        }
        expect(errorSpy).toHaveBeenCalledWith(401, "invalid credentials");
        expect(debugSpy).toHaveBeenCalledWith("failed to retrieve an access token using credentials. aborting");
    });

    test('auth refresh retry', async () => {
        mockedAxios.post.mockResolvedValue(Promise.resolve({status: 200, data: token}));
        const debugSpy = jest.spyOn(console, 'debug');
        const client = new Client();
        await client.init(
            {username: "admin", password: "admin"},
            "https://localhost:9443");
        mockedAxios.post.mockResolvedValue(Promise.resolve({status: 500}));
        setTimeout(() => {
            expect(debugSpy).toHaveBeenCalledTimes(4);
            expect(mockedAxios.mock).toHaveBeenCalledWith({
                refresh_token: token.refresh_token,
                grant_type: "refresh_token"
            });
        }, 1100);
    });

    test('adds auth header and baseUrl', async () => {
        mockedAxios.post.mockResolvedValue(Promise.resolve({status: 200, data: token}));
        const mockRequest = mockedAxios.request.mockResolvedValue(Promise.resolve({status: 200, data: {}}));
        const auth = await initClient({username: "admin", password: "admin"},
            "https://localhost:9443");
        const res = await auth.request({method: "GET", headers: {"content-type": "application/json"}});
        expect(res).toEqual({status: 200, data: {}});
        expect(mockRequest)
            .toHaveBeenCalledWith({
                method: "GET",
                baseURL: "https://localhost:9443",
                headers: {
                    authorization: `${token.token_type} ${token.access_token}`,
                    "content-type": "application/json",
                }
            });
    });
});
