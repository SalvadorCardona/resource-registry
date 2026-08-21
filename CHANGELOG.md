# resource-registry

## 0.2.0

### Minor Changes

- c13ff55: Initial release: a metadata registry keyed by JSON-LD IRI, with `searchMetaData`
  resolving the closest resource by `@type` and `@for` tags when the exact IRI is
  unknown. Covered by 10 tests.
