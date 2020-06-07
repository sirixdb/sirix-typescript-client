import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType, MetaType} from "../src/info";
import Resource from "../src/resource";
import {dataForQuery, resourceQuery} from "../resources/data"

let sirix: Sirix;
let db: Database;
let resource: Resource;

describe('test Resource class', () => {
    beforeEach(async () => {
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        await sirix.deleteAll();
        db = sirix.database("testing", DBType.JSON);
        resource = db.resource('test');
    });
    afterEach(async () => {
        await sirix.deleteAll();
        sirix.shutdown();
    });

    test('Resource.create()', async () => {
        const res = await resource.create('[]');
        expect(await res.json()).toEqual([]);
    });

    test('Resource.query()', async () => {
        await resource.create(JSON.stringify(dataForQuery));
        const res = await resource.query({query: resourceQuery});
        expect(res).toEqual({"rest": [6]});
    });

    test('Resource.delete()', async () => {
        await resource.create('[]');
        await resource.delete(null, null);
        expect(await resource.exists()).toBeFalsy();
    });

    test('Resource.delete() non-existent', async () => {
        const res = await resource.delete(null, null);
        await expect(res.ok).toBeFalsy();
    });

    test('Resource.read()', async () => {
        await resource.create('[]');
        const res = await resource.read({});
        expect(res).toEqual([]);
    });

    test('Resource.getEtag()', async () => {
        await resource.create('[]');
        const etag = await resource.getEtag(1);
        expect(typeof etag === "string");
    });

    test('Resource.getEtag() non-existent', async () => {
        await resource.create('[]');
        const res = await resource.getEtag(2);
        await expect(res).toBeUndefined();
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
        await resource.create('[]');
        const etag = await resource.getEtag(1);
        await resource.update({nodeId: 1, data: '{}', etag});
        await expect(await resource.read({})).toEqual([{}]);
    });

    test('Resource.update() by nodeId', async () => {
        await resource.create('[]');
        await resource.update({nodeId: 1, data: '{}'});
        await expect(await resource.read({})).toEqual([{}]);
    });

    test('Resource.update() non-existent', async () => {
        await resource.create('[]');
        const res = await resource.update({nodeId: 2, data: '{}'})
        await expect(res.ok).toBeFalsy();
    });

    test('Resource.readWithMetadata({})', async () => {
        await resource.create('[]');
        const res = await resource.readWithMetadata({revision: 1});
        expect(res).toEqual({
            "metadata": {
                "nodeKey": 1,
                "hash": 54776712958846245656800940890181827689,
                "type": "ARRAY",
                "descendantCount": 0,
                "childCount": 0,
            },
            "value": [],
        });
    });

    test('Resource.readWithMetadata({metaType: MetaType.KEY})',
        async () => {
            await resource.create('[{"test": "dict"}]');
            const res = await resource.readWithMetadata(
                {metaType: MetaType.KEY});
            expect(res).toEqual({
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
            });
        });

    test('Resource.readWithMetadata({metaType: MetaType.KEYAndCHILD})',
        async () => {
            await resource.create('[{}]');
            const res = await resource.readWithMetadata(
                {metaType: MetaType.KEYAndChild});
            expect(res).toEqual({
                "metadata": {"childCount": 1, "nodeKey": 1},
                "value": [{"metadata": {"childCount": 0, "nodeKey": 2}, "value": {}}]
            });
        });

    test('resource.history()', async () => {
        await resource.create('[]');
        await resource.update({nodeId: 1, data: '{}'});
        await resource.delete(2, null);
        const res = await resource.history();
        expect(res).toHaveLength(3);
    });

    test('Resource.diff()', async () => {
        await resource.create('[]');
        await resource.update({nodeId: 1, data: '{}'});
        const res = await resource.diff(1, 2,
            {nodeId: 1, maxLevel: 4});
        expect(res).toEqual([
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
        ]);
    });
});