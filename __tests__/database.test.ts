let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
import Resource from "../src/resource";
import JsonStore from "../src/jsonStore";
import {token} from "./data";


describe('test Database class', () => {
    let sirix: Sirix;
    let db: Database;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        db = sirix.database("testing", DBType.JSON);
    });
    afterEach(async () => {
        sirix.shutdown();
    });

    test('Database.create() and getInfo', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo,
                                                  requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing");
            expect(requestInit.method).toEqual("PUT");
            return new Response(null, {status: 200});
        });
        await db.create();
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify({
                "resources": []
            }), {status: 200});
        });
        const info = await db.getInfo();
        expect(info).toEqual({
            "resources": []
        });
    });

    test('Database.delete()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        await db.delete();
    });

    test('Database.resources()', () => {
        const resource = db.resource("test");
        expect(resource).toBeInstanceOf(Resource);
    })

    test('Database.resource() properties', () => {
        const resource = db.resource("myres");
        expect(resource.dbName).toEqual("testing");
        expect(resource.name).toEqual("myres");
        expect(resource.dbType).toEqual(DBType.JSON);
    });
});

describe('test Database class (XML)', () => {
    let sirix: Sirix;
    let db: Database;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        db = sirix.database("testing-xml", DBType.XML);
    });
    afterEach(async () => {
        sirix.shutdown();
    });

    test('XML Database.create() sends correct content-type', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing-xml");
            expect(requestInit.method).toEqual("PUT");
            // @ts-ignore
            expect(requestInit.headers["content-type"]).toEqual("application/xml");
            return new Response(null, {status: 200});
        });
        await db.create();
    });

    test('XML Database.resource() has correct dbType', () => {
        const resource = db.resource("xmlres");
        expect(resource.dbType).toEqual(DBType.XML);
    });

    test('XML Database.jsonStore() throws', () => {
        expect(() => db.jsonStore("store")).toThrow("JsonStore is only available for JSON databases");
    });

    test('XML Database.delete()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing-xml");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        await db.delete();
    });

    test('XML Database.getInfo()', async () => {
        const info = {name: "testing-xml", type: "XML", resources: ["res1"]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing-xml");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(info), {status: 200});
        });
        const result = await db.getInfo();
        expect(result).toEqual(info);
    });
});
