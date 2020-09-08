import {mocked} from "ts-jest/utils";

let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType, MetaType} from "../src/info";
import Resource from "../src/resource";
import {token, resourceQuery} from "../resources/data"


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
        const diff = [
            {
                "insert": {
                    "nodeKey": 2,
                    "insertPositionNodeKey": 1,
                    "insertPosition": "asFirstChild",
                    "deweyID": "1.3.3",
                    "depth": 2,
                    "type": "jsonFragment",
                    "data": "{}",
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
        expect(res).toEqual(diff);
    });
});
