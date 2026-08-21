import { beforeEach, describe, expect, it } from "vitest"
import { createResource, getResource, resourceRegistered } from "@/ResourceInterface"
import { searchMetaData } from "@/SearchMetaData"

const clearRegistry = () => {
  for (const key of Object.keys(resourceRegistered)) {
    delete resourceRegistered[key]
  }
}

describe("createResource / getResource", () => {
  beforeEach(clearRegistry)

  it("registers a resource under its IRI and finds it back", () => {
    createResource("articles", { "@type": "Article", name: "Articles" })
    expect(getResource("articles")).toMatchObject({
      "@id": "articles",
      "@type": "Article",
    })
  })

  it("finds a resource from an item carrying its IRI", () => {
    createResource("articles", { "@type": "Article" })
    // getLdIri accepts an IRI as readily as a full JSON-LD object
    expect(getResource({ "@id": "articles" })).toBeDefined()
  })

  it("returns undefined for an unknown IRI", () => {
    expect(getResource("inconnue")).toBeUndefined()
  })

  it("overwrites the previous entry when the same IRI is registered again", () => {
    createResource("articles", { "@type": "Article", name: "Premier" })
    createResource("articles", { "@type": "Article", name: "Second" })
    expect(getResource<{ name: string }>("articles")?.name).toBe("Second")
    expect(Object.keys(resourceRegistered)).toHaveLength(1)
  })
})

describe("searchMetaData", () => {
  beforeEach(clearRegistry)

  it("prefers an exact IRI match over anything else", () => {
    createResource("articles", { "@type": "Article", name: "Exact" })
    createResource("autre", { "@type": "Article", "@for": ["blog"], name: "Score" })

    const found = searchMetaData<{ name: string }>({
      "@id": "articles",
      "@type": "Article",
      "@for": ["blog"],
    })

    expect(found?.name).toBe("Exact")
  })

  it("falls back to a matching @type when the IRI is unknown", () => {
    createResource("articles", { "@type": "Article", name: "Par type" })
    expect(
      searchMetaData<{ name: string }>({ "@id": "", "@type": "Article" })?.name
    ).toBe("Par type")
  })

  it("prefers the candidate sharing the most @for tags", () => {
    // Scoring: a matching @type is worth 20, each shared @for tag is worth 10.
    createResource("parType", { "@type": "Article" })
    createResource("parTags", {
      "@type": "Autre",
      "@for": ["blog", "public", "home"],
    })

    const found = searchMetaData({
      "@id": "",
      "@type": "Article",
      "@for": ["blog", "public", "home"],
    })

    // 30 (three tags) beats 20 (the type).
    expect(found).toMatchObject({ "@id": "parTags" })
  })

  it("keeps the first registered when two candidates tie", () => {
    // Two shared tags are worth exactly as much as a type match, and the
    // comparison is strictly greater, so the first one registered wins.
    createResource("parType", { "@type": "Article" })
    createResource("parTags", { "@type": "Autre", "@for": ["blog", "public"] })

    const found = searchMetaData({
      "@id": "",
      "@type": "Article",
      "@for": ["blog", "public"],
    })

    expect(found).toMatchObject({ "@id": "parType" })
  })

  it("returns undefined when no candidate scores", () => {
    createResource("articles", { "@type": "Article" })
    expect(searchMetaData({ "@id": "", "@type": "Inexistant" })).toBeUndefined()
  })

  it("returns undefined on an empty registry", () => {
    expect(searchMetaData({ "@id": "", "@type": "Article" })).toBeUndefined()
  })
})
