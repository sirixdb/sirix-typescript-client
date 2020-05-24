import Sirix from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
import Resource from "../src/resource";

describe('test Database class', () => {
    let sirix: Sirix;
    let db: Database;

    beforeEach(async () => {
        sirix = new Sirix();
        await sirix.init({username: "admin", password: "admin"},
            "http://localhost:9443");
        await sirix.deleteAll();
        db = sirix.database("testing", DBType.JSON);
    });
    afterEach(async () => {
        await sirix.deleteAll();
        sirix.shutdown();
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