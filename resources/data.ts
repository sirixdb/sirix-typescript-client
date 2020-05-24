const dataForQuery = {
    "foo": ["bar", null, 2.33],
    "bar": {"hello": "world", "helloo": true},
    "baz": "hello",
    "tada": [{"foo": "bar"}, {"baz": false}, "boo", {}, []],
}

const postQuery = `let $nodeKey := sdb:nodekey(jn:doc('testing','test')=>foo[[2]])
return $nodeKey`

const resourceQuery = `let $nodeKey := sdb:nodekey(.=>foo[[2]])
return $nodeKey`

export {dataForQuery, postQuery, resourceQuery}