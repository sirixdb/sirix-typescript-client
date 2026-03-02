let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import Client from "../src/client";
import {ContentType} from "../src/info";
import {Insert} from "../src/constants";
import {token} from "./data";

describe('test Client class', () => {
    let client: Client;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        client = new Client();
        await client.init({username: "admin", password: "admin"}, "http://localhost:9443");
    });
    afterEach(() => {
        client.shutdown();
    });

    test('globalInfo() with resources=true', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/?withResources=true");
            expect(requestInit.method).toEqual("GET");
            return new Response('{"databases":[]}', {status: 200});
        });
        const res = await client.globalInfo(true);
        expect(res.ok).toBe(true);
    });

    test('globalInfo() with resources=false', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("GET");
            return new Response('{"databases":[]}', {status: 200});
        });
        const res = await client.globalInfo(false);
        expect(res.ok).toBe(true);
    });

    test('globalInfo() defaults to resources=true', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/?withResources=true");
            return new Response('{"databases":[]}', {status: 200});
        });
        await client.globalInfo();
    });

    test('deleteAll()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        const res = await client.deleteAll();
        expect(res.ok).toBe(true);
    });

    test('createDatabase()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb");
            expect(requestInit.method).toEqual("PUT");
            // @ts-ignore
            expect(requestInit.headers["content-type"]).toEqual("application/json");
            return new Response(null, {status: 200});
        });
        await client.createDatabase("mydb", ContentType.JSON);
    });

    test('getDatabaseInfo()', async () => {
        const dbInfo = {name: "mydb", type: "JSON", resources: ["res1"]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(dbInfo), {status: 200});
        });
        const res = await client.getDatabaseInfo("mydb");
        const data = await res.json();
        expect(data).toEqual(dbInfo);
    });

    test('deleteDatabase()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        await client.deleteDatabase("mydb");
    });

    test('resourceExists() returns true for 200', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb/res1");
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200});
        });
        const exists = await client.resourceExists("mydb", ContentType.JSON, "res1");
        expect(exists).toBe(true);
    });

    test('resourceExists() throws ServerError for 404', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response("not found", {status: 404});
        });
        try {
            await client.resourceExists("mydb", ContentType.JSON, "res1");
            expect(true).toBe(false);
        } catch (e) {
            expect(e.status).toBe(404);
        }
    });

    test('createResource() without resourceParams', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb/res1");
            expect(requestInit.method).toEqual("PUT");
            expect(requestInit.body).toEqual("[]");
            return new Response('[]', {status: 200});
        });
        await client.createResource("mydb", ContentType.JSON, "res1", "[]");
    });

    test('createResource() with resourceParams', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("hashType=ROLLING");
            expect(requestInfo).toContain("useDeweyIDs=true");
            expect(requestInfo).toContain("hashKind=hmac");
            return new Response('[]', {status: 200});
        });
        await client.createResource("mydb", ContentType.JSON, "res1", "[]",
            {hashType: "ROLLING", useDeweyIDs: true, hashKind: "hmac"});
    });

    test('readResource()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("http://localhost:9443/mydb/res1");
            expect(requestInit.method).toEqual("GET");
            return new Response('{"foo":"bar"}', {status: 200});
        });
        const res = await client.readResource("mydb", ContentType.JSON, "res1", {});
        const data = await res.json();
        expect(data).toEqual({foo: "bar"});
    });

    test('readResource() with ReadParams', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nodeId=5");
            expect(requestInfo).toContain("revision=2");
            return new Response('{}', {status: 200});
        });
        await client.readResource("mydb", ContentType.JSON, "res1", {nodeId: 5, revision: 2});
    });

    test('history()', async () => {
        const historyData = {
            history: [
                {revision: 1, revisionTimestamp: "2020-01-01", author: "admin", commitMessage: "init"},
                {revision: 2, revisionTimestamp: "2020-01-02", author: "admin", commitMessage: "update"}
            ]
        };
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb/res1/history");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(historyData), {status: 200});
        });
        const commits = await client.history("mydb", ContentType.JSON, "res1");
        expect(commits).toEqual(historyData.history);
        expect(commits).toHaveLength(2);
    });

    test('diff()', async () => {
        const diffData = {diffs: [{insert: {nodeKey: 2}}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("http://localhost:9443/mydb/res1/diff");
            expect(requestInfo).toContain("first-revision=1");
            expect(requestInfo).toContain("second-revision=2");
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(diffData), {status: 200});
        });
        const res = await client.diff("mydb", "res1", {"first-revision": 1, "second-revision": 2});
        const data = await res.json();
        expect(data).toEqual(diffData);
    });

    test('postQuery()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("POST");
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toEqual("jn:doc('db','res')");
            return new Response('{"rest":[]}', {status: 200});
        });
        const res = await client.postQuery({query: "jn:doc('db','res')"});
        const data = await res.json();
        expect(data).toEqual({rest: []});
    });

    test('postQuery() with result indexes', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.startResultSeqIndex).toBe(0);
            expect(body.endResultSeqIndex).toBe(10);
            return new Response('{"rest":[]}', {status: 200});
        });
        await client.postQuery({query: "test", startResultSeqIndex: 0, endResultSeqIndex: 10});
    });

    test('getEtag()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nodeId=1");
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200, headers: {"etag": "abc123"}});
        });
        const res = await client.getEtag("mydb", ContentType.JSON, "res1", {nodeId: 1});
        expect(res.headers.get("etag")).toEqual("abc123");
    });

    test('update()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nodeId=1");
            expect(requestInfo).toContain("insert=asFirstChild");
            expect(requestInit.method).toEqual("POST");
            expect(requestInit.body).toEqual('{"key":"val"}');
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual("etag-val");
            return new Response(null, {status: 200});
        });
        await client.update("mydb", ContentType.JSON, "res1",
            {nodeId: 1, data: '{"key":"val"}', insert: Insert.CHILD, etag: "etag-val"});
    });

    test('resourceDelete() with nodeId', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nodeId=5");
            expect(requestInit.method).toEqual("DELETE");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual("etag-val");
            return new Response(null, {status: 200});
        });
        await client.resourceDelete("mydb", ContentType.JSON, "res1", 5, "etag-val");
    });

    test('resourceDelete() without nodeId deletes entire resource', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/mydb/res1");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        await client.resourceDelete("mydb", ContentType.JSON, "res1", null, null);
    });
});
