import {Sirix, sirixInit} from "../src/sirix";
import Database from "../src/database";
import Resource from "../src/resource";
import {DBType} from "../src/info";
import {DOMParser} from "@xmldom/xmldom";

const domParser = new DOMParser();
const xmlNode = domParser.parseFromString(`
<rest:sequence xmlns:rest="https://sirix.io/rest">
  <rest:item>
    <b rest:id="2">
      <c rest:id="3" />
    </b>
  </rest:item>
</rest:sequence>
`, "application/xml");

describe('Test xml support', () => {
    let sirix: Sirix;
    let db: Database;
    let resource: Resource;

    beforeEach(async () => {
        sirix = await sirixInit("http://localhost:9443",
            {username: "admin", password: "admin"});
        await sirix.deleteAll();
        db = sirix.database("testing-xml", DBType.XML);
        resource = db.resource('test');
    });
    afterEach(async () => {
        await sirix.deleteAll();
        sirix.shutdown();
    });

    test('Resource.read()', async () => {
      /*
        const create = await resource.create('<a><b><c/></b></a>');
        const res = await resource.read({nodeId: 2});
        console.log(res);
        expect(res).toEqual(xmlNode);*/
    });
})
