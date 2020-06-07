import {Sirix, sirixInit} from "../src/sirix";
import {DBType} from "../src/info";
import {dataForQuery, postQuery} from "../resources/data";

describe('test Sirix class', () => {
    let sirix: Sirix;

    beforeEach(async () => {
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        await sirix.deleteAll();
    });
    afterEach(async () => {
        await sirix.deleteAll();
        sirix.shutdown();
    })

    test('getInfo', async () => {
        const data = await sirix.getInfo();
        expect(data).toEqual([]);
        const db = sirix.database("testing", DBType.JSON);
        await db.create();
        const resp = await sirix.getInfo();
        expect(resp).toEqual([{
            "name": "testing",
            "resources": [],
            "type": "json"
        }]);
        await sirix.deleteAll();
    });

    test('Sirix.query()', async () => {
        const resource = sirix.database("testing", DBType.JSON)
            .resource("test");
        await resource.create(JSON.stringify(dataForQuery));
        const res = await sirix.query({query: postQuery});
        expect(res).toEqual('{"rest":[6]}');
    });
});
