let mockedFetch = jest.fn();
jest.mock('fetch-ponyfill', () => {
    return () => ({fetch: mockedFetch})
});
const Response = jest.requireActual('fetch-ponyfill')().Response;
mockedFetch = jest.mocked(mockedFetch, true);

import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import {DBType} from "../src/info";
import JsonStore from "../src/jsonStore";
import {token} from "./data";


describe('test JsonStore class', () => {
    let sirix: Sirix;
    let db: Database;
    let store: JsonStore;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo,
                                                  requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        db = sirix.database("testing", DBType.JSON);
        store = db.jsonStore('store');
    });
    afterEach(async () => {
        sirix.shutdown();
    });

    test('JsonStore via Database.jsonStore()', () => {
        expect(store).toBeInstanceOf(JsonStore);
    });

    test('JsonStore throws for XML databases', () => {
        const xmlDb = sirix.database("xmldb", DBType.XML);
        expect(() => xmlDb.jsonStore("store")).toThrow("JsonStore is only available for JSON databases");
    });

    test('JsonStore.create()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/store");
            expect(requestInit.method).toEqual("PUT");
            expect(requestInit.body).toEqual("[]");
            return new Response('[]', {status: 200});
        });
        await store.create();
    });

    test('JsonStore.create() with initial data', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.body).toEqual('[{"foo":"bar"}]');
            return new Response('[{"foo":"bar"}]', {status: 200});
        });
        await store.create('[{"foo":"bar"}]');
    });

    test('JsonStore.exists()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInit.method).toEqual("HEAD");
            return new Response(null, {status: 200});
        });
        const result = await store.exists();
        expect(result).toBe(true);
    });

    test('JsonStore.resourceHistory()', async () => {
        const data = {
            history: [{revision: 1, revisionTimestamp: "2020-01-01", author: "admin", commitMessage: "init"}]
        };
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/testing/store/history");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.resourceHistory();
        expect(res).toEqual(data.history);
    });

    test('JsonStore.insertOne()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual("http://localhost:9443/");
            expect(requestInit.method).toEqual("POST");
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("append json");
            expect(body.query).toContain("testing");
            expect(body.query).toContain("store");
            return new Response(null, {status: 200});
        });
        await store.insertOne({name: "test", value: 42});
    });

    test('JsonStore.insertMany()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("append json");
            // Should contain statements for both items
            const appendCount = (body.query.match(/append json/g) || []).length;
            expect(appendCount).toBe(2);
            return new Response(null, {status: 200});
        });
        await store.insertMany([{name: "a"}, {name: "b"}]);
    });

    test('JsonStore.findAll() with empty query', async () => {
        const data = {rest: [{name: "a"}, {name: "b"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("for $i in");
            expect(body.query).toContain("return $i");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({});
        expect(res).toEqual([{name: "a"}, {name: "b"}]);
    });

    test('JsonStore.findAll() with query criteria', async () => {
        const data = {rest: [{name: "a", value: 1}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:q");
            expect(body.query).toContain('"name": "a"');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({name: "a"});
        expect(res).toEqual([{name: "a", value: 1}]);
    });

    test('JsonStore.findAll() with projection', async () => {
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('"name": $i."name"');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({}, ["name"]);
        expect(res).toEqual([{name: "a"}]);
    });

    test('JsonStore.findOne()', async () => {
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.startResultSeqIndex).toBe(0);
            expect(body.endResultSeqIndex).toBe(0);
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findOne({name: "a"});
        expect(res).toEqual({name: "a"});
    });

    test('JsonStore.findOne() returns null when no results', async () => {
        const data = {rest: [] as any[]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findOne({name: "nonexistent"});
        expect(res).toBeNull();
    });

    test('JsonStore.findByKey()', async () => {
        const data = {foo: "bar"};
        const url = new URL("http://localhost:9443/testing/store");
        url.searchParams.append("nodeId", "5");
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual(url.toString());
            expect(requestInit.method).toEqual("GET");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findByKey(5);
        expect(res).toEqual(data);
    });

    test('JsonStore.findByKey() with revision', async () => {
        const data = {foo: "bar"};
        const url = new URL("http://localhost:9443/testing/store");
        url.searchParams.append("nodeId", "5");
        url.searchParams.append("revision", "3");
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual(url.toString());
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findByKey(5, 3);
        expect(res).toEqual(data);
    });

    test('JsonStore.updateByKey()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("replace json value of");
            expect(body.query).toContain("sdb:select-item");
            return new Response(null, {status: 200});
        });
        await store.updateByKey(5, {name: "updated"});
    });

    test('JsonStore.updateByKey() with upsert', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("if (empty(");
            expect(body.query).toContain("insert json");
            expect(body.query).toContain("replace json value of");
            return new Response(null, {status: 200});
        });
        await store.updateByKey(5, {name: "updated"}, true);
    });

    test('JsonStore.updateMany()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:q");
            expect(body.query).toContain("local:update-fields");
            return new Response(null, {status: 200});
        });
        await store.updateMany({type: "test"}, {value: 99});
    });

    test('JsonStore.updateMany() with upsert', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:upsert-fields");
            return new Response(null, {status: 200});
        });
        await store.updateMany({type: "test"}, {value: 99}, true);
    });

    test('JsonStore.deleteFieldsByKey()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("delete json");
            expect(body.query).toContain("sdb:select-item");
            expect(body.query).toContain('"name"');
            return new Response(null, {status: 200});
        });
        await store.deleteFieldsByKey(5, ["name"]);
    });

    test('JsonStore.deleteField()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("delete json");
            expect(body.query).toContain("local:q");
            return new Response(null, {status: 200});
        });
        await store.deleteField({type: "test"}, ["value"]);
    });

    test('JsonStore.deleteRecords()', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("delete json");
            expect(body.query).toContain("order by $pos descending");
            expect(body.query).toContain("local:q");
            return new Response(null, {status: 200});
        });
        await store.deleteRecords({type: "test"});
    });

    test('JsonStore.history()', async () => {
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("sdb:item-history");
            expect(body.query).toContain("sdb:select-item");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.history(5);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.history() with subtree=false', async () => {
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("jn:all-times");
            expect(body.query).not.toContain("sdb:item-history");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.history(5, false);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.historyEmbed()', async () => {
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01", revision: {foo: "bar"}}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("jn:all-times");
            expect(body.query).toContain("sdb:hash");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.historyEmbed(5);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.findAll() with revision number', async () => {
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("jn:doc('testing','store', 3)");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({}, undefined, 3);
        expect(res).toEqual([{name: "a"}]);
    });

    test('JsonStore.findAll() with revision Date', async () => {
        const date = new Date("2020-06-15T10:00:00.000Z");
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('xs:dateTime("2020-06-15T10:00:00.000Z")');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({}, undefined, date);
        expect(res).toEqual([{name: "a"}]);
    });

    test('JsonStore.findAll() with startResultIndex and endResultIndex', async () => {
        const data = {rest: [{name: "b"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.startResultSeqIndex).toBe(5);
            expect(body.endResultSeqIndex).toBe(10);
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({}, undefined, undefined, 5, 10);
        expect(res).toEqual([{name: "b"}]);
    });

    test('JsonStore.findOne() with projection', async () => {
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('"name": $i."name"');
            expect(body.startResultSeqIndex).toBe(0);
            expect(body.endResultSeqIndex).toBe(0);
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findOne({type: "test"}, ["name"]);
        expect(res).toEqual({name: "a"});
    });

    test('JsonStore.findOne() with revision', async () => {
        const data = {rest: [{name: "old"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("jn:doc('testing','store', 2)");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findOne({}, undefined, 2);
        expect(res).toEqual({name: "old"});
    });

    test('JsonStore.findByKey() with Date revision', async () => {
        const date = new Date("2020-06-15T10:00:00.000Z");
        const data = {foo: "bar"};
        const url = new URL("http://localhost:9443/testing/store");
        url.searchParams.append("nodeId", "5");
        url.searchParams.append("revision-timestamp", date.toISOString());
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            expect(requestInfo).toEqual(url.toString());
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findByKey(5, date);
        expect(res).toEqual(data);
    });

    test('JsonStore.insertOne() with nested data', async () => {
        const doc: Record<string, any> = {name: "test", nested: {arr: [1, 2, 3], obj: {deep: true}}, val: null};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain(JSON.stringify(doc));
            return new Response(null, {status: 200});
        });
        await store.insertOne(doc);
    });

    test('JsonStore.insertMany() with empty array', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toEqual("");
            return new Response(null, {status: 200});
        });
        await store.insertMany([]);
    });

    test('JsonStore.updateByKey() with multiple fields', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("replace json value of");
            expect(body.query).toContain('"name"');
            expect(body.query).toContain('"value"');
            return new Response(null, {status: 200});
        });
        await store.updateByKey(5, {name: "updated", value: 99});
    });

    test('JsonStore.deleteFieldsByKey() with multiple fields', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('"name"');
            expect(body.query).toContain('"value"');
            const deleteCount = (body.query.match(/delete json/g) || []).length;
            expect(deleteCount).toBe(2);
            return new Response(null, {status: 200});
        });
        await store.deleteFieldsByKey(5, ["name", "value"]);
    });

    test('JsonStore.deleteField() with multiple fields', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:q");
            const deleteCount = (body.query.match(/delete json/g) || []).length;
            expect(deleteCount).toBe(2);
            return new Response(null, {status: 200});
        });
        await store.deleteField({type: "test"}, ["name", "value"]);
    });

    test('JsonStore.history() with revision number', async () => {
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("sdb:item-history");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.history(5, true, 2);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.history() with subtree=false and revision', async () => {
        const data = {rest: [{revisionNumber: 3, revisionTimestamp: "2020-06-01"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("jn:all-times");
            expect(body.query).toContain(", 2)");
            expect(body.query).not.toContain("sdb:item-history");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.history(5, false, 2);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.history() with subtree=false and Date revision', async () => {
        const date = new Date("2020-06-15T10:00:00.000Z");
        const data = {rest: [{revisionNumber: 3, revisionTimestamp: "2020-06-01"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('xs:dateTime("2020-06-15T10:00:00.000Z")');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.history(5, false, date);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.historyEmbed() with revision number', async () => {
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01", revision: {foo: "bar"}}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain(", 3)");
            expect(body.query).toContain("sdb:hash");
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.historyEmbed(5, 3);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.historyEmbed() with Date revision', async () => {
        const date = new Date("2020-06-15T10:00:00.000Z");
        const data = {rest: [{revisionNumber: 1, revisionTimestamp: "2020-01-01", revision: {foo: "bar"}}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain('xs:dateTime("2020-06-15T10:00:00.000Z")');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.historyEmbed(5, date);
        expect(res).toEqual(data.rest);
    });

    test('JsonStore.exists() throws for non-existent resource', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response("not found", {status: 404});
        });
        try {
            await store.exists();
            expect(true).toBe(false);
        } catch (e) {
            expect(e.status).toBe(404);
        }
    });

    test('JsonStore.findAll() returns empty array when no rest field', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            return new Response(JSON.stringify({}), {status: 200});
        });
        const res = await store.findAll({});
        expect(res).toEqual([]);
    });

    test('JsonStore.updateMany() without upsert uses update-fields', async () => {
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:update-fields");
            expect(body.query).not.toContain("local:upsert-fields");
            return new Response(null, {status: 200});
        });
        await store.updateMany({type: "test"}, {value: 99}, false);
    });

    test('JsonStore.findAll() with query and projection combined', async () => {
        const data = {rest: [{name: "a"}]};
        mockedFetch.mockImplementationOnce(async (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
            const body = JSON.parse(requestInit.body as string);
            expect(body.query).toContain("local:q");
            expect(body.query).toContain('"name": $i."name"');
            expect(body.query).toContain('"value": $i."value"');
            return new Response(JSON.stringify(data), {status: 200});
        });
        const res = await store.findAll({type: "test"}, ["name", "value"]);
        expect(res).toEqual([{name: "a"}]);
    });
});

describe('XQuery generation for JS value types', () => {
    // These tests verify the behavioral contract: given JS values,
    // the correct XQuery literals are produced in the query string.
    let sirix: Sirix;
    let store: JsonStore;
    let lastQuery: string;

    beforeEach(async () => {
        mockedFetch.mockImplementationOnce(async (): Promise<Response> => {
            return new Response(JSON.stringify(token), {status: 200});
        });
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        store = sirix.database("db", DBType.JSON).jsonStore('col');

        // capture the query from every postQuery call
        mockedFetch.mockImplementation(async (_ri: RequestInfo,
                                               ri: RequestInit): Promise<Response> => {
            if (ri.body) {
                lastQuery = JSON.parse(ri.body as string).query || "";
            }
            return new Response(null, {status: 200});
        });
    });
    afterEach(() => {
        sirix.shutdown();
        mockedFetch.mockReset();
    });

    test('null values produce jn:null()', async () => {
        await store.updateByKey(1, {field: null});
        expect(lastQuery).toContain("with jn:null()");
    });

    test('true produces true()', async () => {
        await store.updateByKey(1, {active: true});
        expect(lastQuery).toContain("with true()");
    });

    test('false produces false()', async () => {
        await store.updateByKey(1, {deleted: false});
        expect(lastQuery).toContain("with false()");
    });

    test('number values produce numeric literals', async () => {
        await store.updateByKey(1, {count: 42});
        expect(lastQuery).toContain("with 42");
    });

    test('string values produce quoted literals', async () => {
        await store.updateByKey(1, {name: "hello"});
        expect(lastQuery).toContain('with "hello"');
    });

    test('string values with quotes are escaped', async () => {
        await store.updateByKey(1, {msg: 'say "hi"'});
        expect(lastQuery).toContain('with "say \\"hi\\""');
    });

    test('string values with backslashes are escaped', async () => {
        await store.updateByKey(1, {path: 'a\\b'});
        expect(lastQuery).toContain('with "a\\\\b"');
    });

    test('array values produce XQuery array literals', async () => {
        await store.updateByKey(1, {tags: [1, 2, 3]});
        expect(lastQuery).toContain("with [1, 2, 3]");
    });

    test('nested object values produce XQuery object literals', async () => {
        await store.updateByKey(1, {meta: {x: 1}});
        expect(lastQuery).toContain('with {"x": 1}');
    });

    test('mixed types in query criteria', async () => {
        // findAll uses stringify for the filter object
        mockedFetch.mockImplementationOnce(async (_ri: RequestInfo,
                                                   ri: RequestInit): Promise<Response> => {
            lastQuery = JSON.parse(ri.body as string).query || "";
            return new Response(JSON.stringify({rest: []}), {status: 200});
        });
        await store.findAll({active: true, score: 10, label: null});
        expect(lastQuery).toContain('"active": true()');
        expect(lastQuery).toContain('"score": 10');
        expect(lastQuery).toContain('"label": jn:null()');
    });

    test('array with mixed element types', async () => {
        await store.updateByKey(1, {data: [true, "x", 5, null]});
        expect(lastQuery).toContain("with [true(), \"x\", 5, jn:null()]");
    });

    test('deeply nested structures', async () => {
        await store.updateByKey(1, {
            config: {nested: {deep: true}}
        });
        expect(lastQuery).toContain('{"nested": {"deep": true()}}');
    });
});
