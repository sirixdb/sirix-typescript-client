import Client from "./client";
import {
    Commit,
    ContentType,
    DBType,
    QueryParams,
    ReadParams,
    Revision,
    SubtreeRevision,
} from "./info";

const QUERY_FUNCTION =
    `declare function local:q($i, $q) { ` +
    `let $m := for $k in jn:keys($q) ` +
    `return if (not(empty($i.$k))) then deep-equal($i.$k, $q.$k) else false() ` +
    `return empty(index-of($m, false()))};`;

const UPSERT_FUNCTION =
    `declare %updating function local:upsert-fields($r, $u) { ` +
    `for $key in bit:fields($u) ` +
    `return if (empty($r.$key)) then insert json {$key: $u.$key} into $r ` +
    `else replace json value of $r.$key with $u.$key};`;

const UPDATE_FUNCTION =
    `declare %updating function local:update-fields($r, $u) { ` +
    `for $key in bit:fields($u) ` +
    `return replace json value of $r.$key with $u.$key};`;

function stringify(v: any): string {
    if (v === null || v === undefined) {
        return "jn:null()";
    }
    if (v === true) {
        return "true()";
    }
    if (v === false) {
        return "false()";
    }
    if (typeof v === "string") {
        const escaped = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `"${escaped}"`;
    }
    if (typeof v === "number") {
        return `${v}`;
    }
    if (Array.isArray(v)) {
        const items = v.map(item => stringify(item)).join(", ");
        return `[${items}]`;
    }
    if (typeof v === "object") {
        const pairs = Object.entries(v)
            .map(([k, val]) => `"${k}": ${stringify(val)}`)
            .join(", ");
        return `{${pairs}}`;
    }
    return `jn:parse('${JSON.stringify(v)}')`;
}

function buildRevisionParam(revision: Revision): Record<string, string> {
    if (typeof revision === "number") {
        return {revision: revision.toString()};
    } else if (revision instanceof Date) {
        return {"revision-timestamp": revision.toISOString()};
    }
    return {};
}

export default class JsonStore {
    private readonly dbName: string;
    private readonly name: string;
    private readonly _client: Client;

    constructor(dbName: string, resourceName: string, client: Client) {
        this.dbName = dbName;
        this.name = resourceName;
        this._client = client;
    }

    /**
     * Create the store resource with initial data (defaults to empty array).
     */
    public create(data: string = "[]"): Promise<Response> {
        return this._client.createResource(
            this.dbName, ContentType.JSON, this.name, data
        );
    }

    /**
     * Check if the store resource exists.
     */
    public exists(): Promise<boolean> {
        return this._client.resourceExists(
            this.dbName, ContentType.JSON, this.name
        );
    }

    /**
     * Get the full commit history of this resource.
     */
    public resourceHistory(): Promise<Commit[]> {
        return this._client.history(this.dbName, ContentType.JSON, this.name);
    }

    /**
     * Insert a single JSON document into the store.
     */
    public insertOne(insertDict: Record<string, any>): Promise<Response> {
        const query: QueryParams = {
            query:
                `append json jn:parse('${JSON.stringify(insertDict)}') ` +
                `into jn:doc('${this.dbName}','${this.name}')`
        };
        return this._client.postQuery(query);
    }

    /**
     * Insert multiple JSON documents into the store.
     */
    public insertMany(insertList: Record<string, any>[]): Promise<Response> {
        const statements = insertList
            .map(item =>
                `append json jn:parse('${JSON.stringify(item)}') ` +
                `into jn:doc('${this.dbName}','${this.name}')`
            )
            .join("\n");
        const query: QueryParams = {query: statements};
        return this._client.postQuery(query);
    }

    /**
     * Find all documents matching the query criteria.
     */
    public findAll(
        queryDict: Record<string, any>,
        projection?: string[],
        revision?: Revision,
        startResultIndex?: number,
        endResultIndex?: number
    ): Promise<any[]> {
        let queryStr: string;
        const docRef = revision
            ? this._buildDocRef(revision)
            : `jn:doc('${this.dbName}','${this.name}')`;

        if (Object.keys(queryDict).length === 0) {
            queryStr = `for $i in ${docRef} return $i`;
        } else {
            queryStr =
                QUERY_FUNCTION +
                `for $i in ${docRef} ` +
                `where local:q($i, ${stringify(queryDict)}) ` +
                `return $i`;
        }

        if (projection && projection.length > 0) {
            const fields = projection.map(f => `"${f}": $i."${f}"`).join(", ");
            queryStr = queryStr.replace(
                /return \$i$/,
                `return {${fields}}`
            );
        }

        const params: QueryParams = {
            query: queryStr,
            ...(startResultIndex !== undefined && {startResultSeqIndex: startResultIndex}),
            ...(endResultIndex !== undefined && {endResultSeqIndex: endResultIndex}),
        };

        return this._client.postQuery(params)
            .then(res => res.json())
            .then(data => data.rest || []);
    }

    /**
     * Find the first document matching the query criteria.
     */
    public findOne(
        queryDict: Record<string, any>,
        projection?: string[],
        revision?: Revision,
    ): Promise<any> {
        return this.findAll(queryDict, projection, revision, 0, 0)
            .then(results => results.length > 0 ? results[0] : null);
    }

    /**
     * Find a document by its node key.
     */
    public findByKey(
        nodeKey: number,
        revision?: Revision
    ): Promise<any> {
        const params: ReadParams = {nodeId: nodeKey};
        if (revision) {
            if (typeof revision === "number") {
                params.revision = revision;
            } else if (revision instanceof Date) {
                params["revision-timestamp"] = revision.toISOString();
            }
        }
        return this._client.readResource(
            this.dbName, ContentType.JSON, this.name, params
        ).then(res => res.json());
    }

    /**
     * Update a document identified by node key.
     */
    public updateByKey(
        nodeKey: number,
        updateDict: Record<string, any>,
        upsert: boolean = false
    ): Promise<Response> {
        const statements = Object.entries(updateDict).map(([key, val]) => {
            const item = `sdb:select-item(jn:doc('${this.dbName}','${this.name}'), ${nodeKey})`;
            if (upsert) {
                return `if (empty(${item}."${key}")) ` +
                    `then insert json {"${key}": ${stringify(val)}} into ${item} ` +
                    `else replace json value of ${item}."${key}" with ${stringify(val)}`;
            } else {
                return `replace json value of ${item}."${key}" with ${stringify(val)}`;
            }
        }).join("\n");

        return this._client.postQuery({query: statements});
    }

    /**
     * Update many documents matching query criteria.
     */
    public updateMany(
        queryDict: Record<string, any>,
        updateDict: Record<string, any>,
        upsert: boolean = false
    ): Promise<Response> {
        const funcDecl = upsert ? UPSERT_FUNCTION : UPDATE_FUNCTION;
        const funcName = upsert ? "local:upsert-fields" : "local:update-fields";

        const query =
            QUERY_FUNCTION +
            funcDecl +
            `for $i in jn:doc('${this.dbName}','${this.name}') ` +
            `where local:q($i, ${stringify(queryDict)}) ` +
            `return ${funcName}($i, ${stringify(updateDict)})`;

        return this._client.postQuery({query});
    }

    /**
     * Delete specific fields from a document identified by node key.
     */
    public deleteFieldsByKey(
        nodeKey: number,
        fields: string[]
    ): Promise<Response> {
        const item = `sdb:select-item(jn:doc('${this.dbName}','${this.name}'), ${nodeKey})`;
        const statements = fields
            .map(field => `delete json ${item}."${field}"`)
            .join("\n");
        return this._client.postQuery({query: statements});
    }

    /**
     * Delete specific fields from documents matching query criteria.
     */
    public deleteField(
        queryDict: Record<string, any>,
        fields: string[]
    ): Promise<Response> {
        const deletes = fields
            .map(field => `delete json $i."${field}"`)
            .join("\n");
        const query =
            QUERY_FUNCTION +
            `for $i in jn:doc('${this.dbName}','${this.name}') ` +
            `where local:q($i, ${stringify(queryDict)}) ` +
            `return (${deletes})`;
        return this._client.postQuery({query});
    }

    /**
     * Delete all documents matching query criteria.
     */
    public deleteRecords(
        queryDict: Record<string, any>
    ): Promise<Response> {
        const query =
            QUERY_FUNCTION +
            `let $doc := jn:doc('${this.dbName}','${this.name}') ` +
            `for $i at $pos in $doc ` +
            `where local:q($i, ${stringify(queryDict)}) ` +
            `order by $pos descending ` +
            `return delete json $doc[[$pos]]`;
        return this._client.postQuery({query});
    }

    /**
     * Get the history of a specific node in the resource.
     */
    public history(
        nodeKey: number,
        subtree: boolean = true,
        revision?: Revision
    ): Promise<SubtreeRevision[]> {
        let query: string;
        if (subtree) {
            query = `let $item := sdb:select-item(jn:doc('${this.dbName}','${this.name}'), ${nodeKey}) ` +
                `return sdb:item-history($item)`;
        } else {
            const revParam = revision ? `, ${typeof revision === "number" ? revision : `xs:dateTime("${(revision as Date).toISOString()}")`}` : "";
            query = `let $item := sdb:select-item(jn:doc('${this.dbName}','${this.name}'${revParam}), ${nodeKey}) ` +
                `let $h := jn:all-times($item) ` +
                `return for $t at $pos in $h ` +
                `where not(deep-equal($t, $h[$pos - 1])) ` +
                `return {"revisionNumber": sdb:revision($t), "revisionTimestamp": xs:string(sdb:timestamp($t))}`;
        }
        return this._client.postQuery({query})
            .then(res => res.json())
            .then(data => data.rest || []);
    }

    /**
     * Get the history of a node with full revision data embedded.
     */
    public historyEmbed(
        nodeKey: number,
        revision?: Revision
    ): Promise<any[]> {
        const revParam = revision ? `, ${typeof revision === "number" ? revision : `xs:dateTime("${(revision as Date).toISOString()}")`}` : "";
        const query = `let $item := sdb:select-item(jn:doc('${this.dbName}','${this.name}'${revParam}), ${nodeKey}) ` +
            `let $h := jn:all-times($item) ` +
            `return for $t at $pos in $h ` +
            `where not(sdb:hash($t) eq sdb:hash($h[$pos - 1])) ` +
            `return {"revisionNumber": sdb:revision($t), "revisionTimestamp": xs:string(sdb:timestamp($t)), "revision": $t}`;
        return this._client.postQuery({query})
            .then(res => res.json())
            .then(data => data.rest || []);
    }

    private _buildDocRef(revision: Revision): string {
        if (typeof revision === "number") {
            return `jn:doc('${this.dbName}','${this.name}', ${revision})`;
        } else if (revision instanceof Date) {
            return `jn:doc('${this.dbName}','${this.name}', xs:dateTime("${revision.toISOString()}"))`;
        }
        return `jn:doc('${this.dbName}','${this.name}')`;
    }
}
