let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import {token, postQuery} from "./data";

describe('test Sirix class', () => {
    let sirix: Sirix;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo,
                                                  requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
    });
    afterEach(async () => {
        sirix.shutdown();
    })

    test('getInfo', async () => {
        // @ts-ignore
        const data = {databases: []};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/?withResources=true");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await sirix.getInfo();
        expect(res).toEqual([]);
    });

    test('Sirix.query()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.body).toEqual(JSON.stringify({query: postQuery}));
            return new Response('{"rest":[6]}', {status: 200});
        });
        const res = await sirix.query({query: postQuery});
        expect(res).toEqual('{"rest":[6]}');
    });
});
