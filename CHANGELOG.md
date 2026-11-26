# Changelog

## Unreleased

- **Breaking:** the paginated read option `lastTopLevelNodeKey` is renamed to `startNodeKey` (`Resource.read`, `Resource.readWithMetadata`, `ReadParams`). The client sends `startNodeKey` on the wire; there is no deprecated alias. The Sirix server answers a request carrying `lastTopLevelNodeKey` with a 400 that names `startNodeKey`.
