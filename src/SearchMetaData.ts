import { BaseJsonLdItemInterface } from "jsonld-item"
import {
  getResource,
  resourceRegistered,
} from "@/ResourceInterface"

export function searchMetaData<T = BaseJsonLdItemInterface>(
  query: BaseJsonLdItemInterface & { "@for"?: string[] }
): T | undefined {
  // 1. An exact IRI match wins outright
  const exactMatch = getResource<T>(query)
  if (exactMatch) return exactMatch

  let bestMatch: BaseJsonLdItemInterface | undefined = undefined
  let maxScore = 0

  const candidates = Object.values(resourceRegistered)

  for (const candidate of candidates) {
    let score = 0

    // 2. Strong score for a matching @type
    if (query["@type"] && candidate["@type"] === query["@type"]) {
      score += 20
    }

    // 3. Cumulative score for tags shared through @for
    if (query["@for"] && candidate["@for"]) {
      const intersection = query["@for"].filter((tag) =>
        candidate["@for"]?.includes(tag)
      )
      score += intersection.length * 10
    }

    // Keep the highest-scoring candidate
    if (score > 0 && score > maxScore) {
      maxScore = score
      bestMatch = candidate
    }
  }

  return bestMatch as T | undefined
}
