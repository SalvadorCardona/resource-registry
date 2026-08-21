# resource-registry

A metadata registry keyed by JSON-LD IRI, with similarity lookup for when the
exact IRI is unknown.

The problem it solves: an application declares "resources" — the description of
a data type, its view, its form — and later needs to find the right one from an
item returned by the API. Sometimes the IRI is enough; often all you know is the
type, or the intended usage.

```ts
import { createResource, getResource, searchMetaData } from "resource-registry"

createResource("articles", {
  "@type": "Article",
  "@for": ["blog", "public"],
  name: "Articles",
})

getResource("articles") // by exact IRI
searchMetaData({ "@id": "", "@type": "Article" }) // by similarity
```

## Installation

```bash
pnpm add resource-registry
```

`jsonld-item` is a dependency; no React, no framework.

## API

### `createResource(iri, resource)`

Registers a resource under its IRI and returns the built object. Reusing the
same IRI replaces the previous entry.

```ts
const articles = createResource("articles", { "@type": "Article" })
// → { "@id": "articles", "@type": "Article" }
```

### `getResource(iriOrItem)`

Reads a resource by IRI. Accepts either the string or any JSON-LD object
carrying an `@id` — convenient when starting from an item returned by the API.

### `searchMetaData(query)`

Finds the resource closest to a query. An exact IRI match always wins;
otherwise each candidate is scored:

| Criterion | Points |
| --- | --- |
| Same `@type` | 20 |
| Each shared `@for` tag | 10 |

The highest score wins, and a score of zero returns nothing. Two shared tags are
therefore worth exactly as much as a type match; on a tie, the resource
registered first is kept.

```ts
createResource("articleCard", { "@type": "Article", "@for": ["list"] })
createResource("articleFull", { "@type": "Article", "@for": ["detail"] })

searchMetaData({ "@id": "", "@type": "Article", "@for": ["detail"] })
// → articleFull (20 + 10) over articleCard (20)
```

The `@for` tag exists to hold several resources of the same type apart by
usage: a compact card for a list, a full sheet for a detail page.

### `resourceRegistered`

The registry itself, exposed so you can iterate it or clear it in tests.

```ts
Object.values(resourceRegistered).filter((r) => r["@type"] === "Article")
```

## One registry per application

`resourceRegistered` is a module-level singleton. Two copies of the package in
`node_modules` would mean two registries: a resource registered on one side
would be invisible from the other.

Libraries consuming this package must therefore declare it as a
**peerDependency**, never a dependency — as
[`react-data-form`](https://github.com/SalvadorCardona/react-data-form) does,
registering its forms alongside the application's own resources.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## License

MIT
