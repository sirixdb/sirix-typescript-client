let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
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

    test('Sirix.getInfo(false) omits withResources', async () => {
        const data = {databases: [{name: "db1", type: "JSON", resources: [] as string[]}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await sirix.getInfo(false);
        expect(res).toEqual(data.databases);
    });

    test('Sirix.deleteAll() returns true on success', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        const res = await sirix.deleteAll();
        expect(res).toBe(true);
    });

    test('Sirix.deleteAll() returns false on failure', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response("error", {status: 500});
        });
        const res = await sirix.deleteAll();
        expect(res).toBe(false);
    });

    test('Sirix.database() returns Database instance', () => {
        const db = sirix.database("mydb", DBType.JSON);
        expect(db).toBeInstanceOf(Database);
        expect(db.name).toEqual("mydb");
        expect(db.dbType).toEqual(DBType.JSON);
    });

    test('Sirix.database() XML type', () => {
        const db = sirix.database("xmldb", DBType.XML);
        expect(db).toBeInstanceOf(Database);
        expect(db.dbType).toEqual(DBType.XML);
    });

    test('Sirix.query() with result indexes', async () => {
        const queryParams = {query: "for $i in jn:doc('db','res') return $i", startResultSeqIndex: 0, endResultSeqIndex: 5};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("POST");
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toEqual(queryParams.query);
            expect(body.startResultSeqIndex).toBe(0);
            expect(body.endResultSeqIndex).toBe(5);
            return new Response('{"rest":[1,2,3]}', {status: 200});
        });
        const res = await sirix.query(queryParams);
        expect(res).toEqual('{"rest":[1,2,3]}');
    });
});
