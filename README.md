# SirixDB Client Library

### This is alpha software

## Paginated reads

Use `nextTopLevelNodes` and `startNodeKey` with `Resource.read` or
`Resource.readWithMetadata` for paginated reads. `ReadParams` uses the same
`startNodeKey` query parameter on the wire. Replace the former
`lastTopLevelNodeKey` option with `startNodeKey`; no deprecated alias is provided.

```typescript
await resource.read({nextTopLevelNodes: 10, startNodeKey: 11});
```

Use a Sirix server that supports `startNodeKey`. The matching server change
rejects requests carrying `lastTopLevelNodeKey` with HTTP 400 and an error message
that names `startNodeKey`.
