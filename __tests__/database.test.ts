import {mocked} from "ts-jest/utils";

let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
import Resource from "../src/resource";
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
});
