import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
import Resource from "../src/resource";

describe('test Database class', () => {
    let sirix: Sirix;
    let db: Database;

    beforeEach(async done => {
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        await sirix.deleteAll();
        db = sirix.database("testing", DBType.JSON);
        done();
    });
    afterEach(async done => {
        await sirix.deleteAll();
        sirix.shutdown();
        done();
    });

    test('Database.create() and getInfo', async () => {
        await db.create();
        const info = await db.getInfo();
        expect(info).toEqual({
            "resources": []
        });
    });

    test('Database.delete()', async () => {
        await db.create();
        await db.delete();
        await expect(db.getInfo()).rejects.toThrow();
    });

    test('Database.resources()', () => {
        const resource = db.resource("test");
        expect(resource).toBeInstanceOf(Resource);
    })
});