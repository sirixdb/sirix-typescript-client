let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType, MetaType} from "../src/info";
import Resource from "../src/resource";
import {Insert} from "../src/constants";
import {token, resourceQuery} from "./data"


describe('test Resource class', () => {
    let sirix: Sirix;
    let db: Database;
    let resource: Resource;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo,
                                                  requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        db = sirix.database("testing", DBType.JSON);
        resource = db.resource('test');
    });
    afterEach(async () => {
        sirix.shutdown();
    });

    test('Resource.create()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test");
            expect(requestInit.method).toEqual("PUT");
            expect(requestInit.body).toEqual("[]");
            return new Response('[]', {status: 200});
        });
        const res = await resource.create('[]');
        expect(await res.json()).toEqual([]);
    });

    test('Resource.query()', async () => {
        const url = new URL("http://localhost:9443/testing/test");
        url.searchParams.append("query", resourceQuery)
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual(url.toString());
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify({"rest": [6]}), {status: 200});
        });
        const res = await resource.query({query: resourceQuery});
        expect(res).toEqual({"rest": [6]});
    });

    test('Resource.delete()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test");
            expect(requestInit.method).toEqual("DELETE");
            return new Response(null, {status: 200});
        });
        await resource.delete(null, null);
    });

    test('Resource.delete() non-existent', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 500});
        });
        try {
            await resource.delete(null, null);
            // we should have already thrown an error
            expect(true).toBe(false);
        } catch {
        }
    });

    test('Resource.read()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response("[]", {status: 200});
        });
        const res = await resource.read({});
        expect(res).toEqual([]);
    });

    test('Resource.getEtag()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200, headers: {"etag": "blah"}});
        });
        const etag = await resource.getEtag(1);
        expect(etag).toEqual("blah");
    });

    test('Resource.getEtag() non-existent', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 500});
        });
        try {
            await resource.getEtag(2);
            // an error should've been thrown already
            expect(true).toEqual(false);
        } catch {
        }
    });

    /*    test('Resource.delete() by nodeId', async () => {
            await resource.create('[]');
            await resource.delete(1, null);
            const res = await resource.delete(1, null);
            expect(res.ok).toBeFalsy();
        });

        test('Resource.delete() with etag', async () => {
            await resource.create('[]');
            const etag = await resource.getEtag(1);
            await resource.delete(1, etag);
            const res = await resource.delete(1, null);
            await expect(res.ok).toBeFalsy();
        });
    */
    test('Resource.update() with etag', async () => {
        const etag = "blah";
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.body).toEqual('{}');
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?nodeId=1&insert=asFirstChild");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual(etag);
            return new Response(null, {status: 200});
        });
        await resource.update({nodeId: 1, data: '{}', etag});
    });

    test('Resource.update() by nodeId', async () => {
        const etag = "blah";
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 200, headers: {etag}});
        });
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.body).toEqual('{}');
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?nodeId=1&insert=asFirstChild");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual(etag);
            return new Response(null, {status: 200});
        });
        await resource.update({nodeId: 1, data: '{}'});
    });

    test('Resource.update() non-existent', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 200, headers: {etag: "blah"}});
        });
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 500});
        });
        try {
            await resource.update({nodeId: 2, data: '{}'});
            // an error should've already been thrown
            expect(true).toEqual(false);
        } catch {
        }
    });

    test('Resource.readWithMetadata({})', async () => {
        const metadata = {
            "metadata": {
                "nodeKey": 1,
                "hash": 54776712958846245656800940890181827689,
                "type": "ARRAY",
                "descendantCount": 0,
                "childCount": 0,
            },
            // @ts-ignore
            "value": [],
        };
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?revision=1&withMetadata=true");
            return new Response(JSON.stringify(metadata), {status: 200});
        });
        const res = await resource.readWithMetadata({revision: 1});
        expect(res).toEqual(metadata);
    });

    test('Resource.readWithMetadata({metaType: MetaType.KEY})',
        async () => {
            const metadata = {
                "metadata": {"nodeKey": 1},
                "value": [
                    {
                        "metadata": {"nodeKey": 2},
                        "value": [
                            {
                                "key": "test",
                                "metadata": {"nodeKey": 3},
                                "value": {"metadata": {"nodeKey": 4}, "value": "dict"}
                            }
                        ]
                    }
                ]
            };
            mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
                expect(requestInfo).toEqual("http://localhost:9443/testing/test?withMetadata=nodeKey");
                return new Response(JSON.stringify(metadata), {status: 200});
            });
            const res = await resource.readWithMetadata(
                {metaType: MetaType.KEY});
            expect(res).toEqual(metadata);
        });

    test('Resource.readWithMetadata({metaType: MetaType.KEYAndCHILD})',
        async () => {
            const metadata = {
                "metadata": {"childCount": 1, "nodeKey": 1},
                "value": [{"metadata": {"childCount": 0, "nodeKey": 2}, "value": {}}]
            };
            mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
                expect(requestInfo).toEqual("http://localhost:9443/testing/test?withMetadata=nodeKeyAndChildCount");
                return new Response(JSON.stringify(metadata), {status: 200});
            });
            const res = await resource.readWithMetadata(
                {metaType: MetaType.KEYAndChild});
            expect(res).toEqual(metadata);
        });

    test('resource.history()', async () => {
        const data = {
            history: [{}, {}, {}]
        };
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test/history");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await resource.history();
        expect(res).toEqual(data.history);
    });

    test('Resource.diff()', async () => {
        const diff = [{
            "insert": {
                "data": "{}",
                "depth": 2,
                "deweyID": "1.3.3",
                "insertPosition": "asFirstChild",
                "insertPositionNodeKey": 1,
                "nodeKey": 2,
                "type": "jsonFragment"
            }
        }
        ];
        const data = {diffs: diff}
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test/diff?startNodeKey=1&maxDepth=4&first-revision=1&second-revision=2");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await resource.diff(1, 2,
            {nodeId: 1, maxLevel: 4});
        expect(res).toEqual(data);
    });

    test('Resource.exists() returns true', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test");
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200});
        });
        const result = await resource.exists();
        expect(result).toBe(true);
    });

    test('Resource.exists() throws for 404', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("HEAD");
            return new Response("not found", {status: 404});
        });
        try {
            await resource.exists();
            expect(true).toBe(false);
        } catch (e) {
            expect(e.status).toBe(404);
        }
    });

    test('Resource.read() with revision number', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?revision=3&prettyPrint=false");
            return new Response('{"foo":"bar"}', {status: 200});
        });
        const res = await resource.read({revision: 3});
        expect(res).toEqual({foo: "bar"});
    });

    test('Resource.read() with revision timestamp', async () => {
        const date = new Date("2020-06-15T10:00:00.000Z");
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("revision-timestamp=2020-06-15T10%3A00%3A00.000Z");
            return new Response('{"foo":"bar"}', {status: 200});
        });
        const res = await resource.read({revision: date});
        expect(res).toEqual({foo: "bar"});
    });

    test('Resource.read() with revision range (numbers)', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("start-revision=1");
            expect(requestInfo).toContain("end-revision=5");
            return new Response('[]', {status: 200});
        });
        const res = await resource.read({revision: [1, 5]});
        expect(res).toEqual([]);
    });

    test('Resource.read() with revision range (dates)', async () => {
        const start = new Date("2020-01-01T00:00:00.000Z");
        const end = new Date("2020-12-31T23:59:59.000Z");
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("start-revision-timestamp=2020-01-01T00%3A00%3A00.000Z");
            expect(requestInfo).toContain("end-revision-timestamp=2020-12-31T23%3A59%3A59.000Z");
            return new Response('[]', {status: 200});
        });
        const res = await resource.read({revision: [start, end]});
        expect(res).toEqual([]);
    });

    test('Resource.read() with nodeId and maxLevel', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nodeId=5");
            expect(requestInfo).toContain("maxLevel=2");
            return new Response('{"nested":"value"}', {status: 200});
        });
        const res = await resource.read({nodeId: 5, maxLevel: 2});
        expect(res).toEqual({nested: "value"});
    });

    test('Resource.read() with undefined input', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?prettyPrint=false");
            return new Response('[]', {status: 200});
        });
        const res = await resource.read(undefined);
        expect(res).toEqual([]);
    });

    test('Resource.read() with nextTopLevelNodes and lastTopLevelNodeKey', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("nextTopLevelNodes=10");
            expect(requestInfo).toContain("lastTopLevelNodeKey=5");
            return new Response('[]', {status: 200});
        });
        const res = await resource.read({nextTopLevelNodes: 10, lastTopLevelNodeKey: 5});
        expect(res).toEqual([]);
    });

    test('Resource.diff() with Date revisions', async () => {
        const date1 = new Date("2020-01-01T00:00:00.000Z");
        const date2 = new Date("2020-06-01T00:00:00.000Z");
        const data = {diffs: [] as any[]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("first-revision=2020-01-01T00%3A00%3A00.000Z");
            expect(requestInfo).toContain("second-revision=2020-06-01T00%3A00%3A00.000Z");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await resource.diff(date1, date2);
        expect(res).toEqual(data);
    });

    test('Resource.diff() with includeData', async () => {
        const data = {diffs: [] as any[]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("include-data=true");
            expect(requestInfo).toContain("first-revision=1");
            expect(requestInfo).toContain("second-revision=2");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await resource.diff(1, 2, {includeData: true});
        expect(res).toEqual(data);
    });

    test('Resource.delete() with nodeId auto-fetches etag', async () => {
        const etag = "auto-etag";
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200, headers: {"etag": etag}});
        });
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("DELETE");
            expect(requestInfo).toContain("nodeId=5");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual(etag);
            return new Response(null, {status: 200});
        });
        await resource.delete(5, null);
    });

    test('Resource.delete() with nodeId and explicit etag', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("DELETE");
            expect(requestInfo).toContain("nodeId=3");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual("explicit-etag");
            return new Response(null, {status: 200});
        });
        await resource.delete(3, "explicit-etag");
    });

    test('Resource.create() with resourceParams', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toContain("hashType=ROLLING");
            expect(requestInfo).toContain("useDeweyIDs=true");
            expect(requestInit.method).toEqual("PUT");
            return new Response('{}', {status: 200});
        });
        await resource.create('{}', {hashType: "ROLLING", useDeweyIDs: true});
    });

    test('Resource.update() with explicit insert position', async () => {
        const etag = "etag-val";
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/test?nodeId=1&insert=asRightSibling");
            // @ts-ignore
            expect(requestInit.headers.ETag).toEqual(etag);
            expect(requestInit.body).toEqual('{"key":"val"}');
            return new Response(null, {status: 200});
        });
        await resource.update({nodeId: 1, data: '{"key":"val"}', insert: Insert.RIGHT, etag});
    });

    test('Resource.getEtag() returns undefined when no etag header', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(null, {status: 200});
        });
        const etag = await resource.getEtag(1);
        expect(etag).toBeUndefined();
    });

    test('Resource.read() parses XML response for XML-type resources', async () => {
        // Behavioral: XML resources are parsed into a DOM Document, not JSON
        const xmlDb = sirix.database("xmldb", DBType.XML);
        const xmlResource = xmlDb.resource("xmltest");

        mockedFetch.mockImplementationOnce(async (): Promise<Response> => {
            return new Response(
                '<root><child attr="val">text</child></root>',
                {status: 200});
        });

        const doc = await xmlResource.read({});
        // @ts-ignore - accessing DOM Document properties
        expect(doc.documentElement.tagName).toEqual("root");
        // @ts-ignore
        expect(doc.documentElement.childNodes[0].tagName).toEqual("child");
        // @ts-ignore
        expect(doc.documentElement.childNodes[0].getAttribute("attr")).toEqual("val");
        // @ts-ignore
        expect(doc.documentElement.childNodes[0].textContent).toEqual("text");
    });
});
