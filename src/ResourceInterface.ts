import {
  BaseJsonLdItemInterface,
  getLdIri,
  JsonLdIri,
  JsonLdIriAble,
  JsonLdIriContainerInterface,
} from "jsonld-item"

export const resourceRegistered: JsonLdIriContainerInterface<BaseJsonLdItemInterface> =
  {}

const addResource = (metaData: BaseJsonLdItemInterface) => {
  resourceRegistered[metaData["@id"]] = metaData
}

export function getResource<T = BaseJsonLdItemInterface>(
  jsonLdIriAble: JsonLdIriAble
): T | undefined {
  const id = getLdIri(jsonLdIriAble)
  if (id && resourceRegistered[id]) return resourceRegistered[id] as T

  return undefined
}

export function createResource<
  T extends BaseJsonLdItemInterface = BaseJsonLdItemInterface,
>(id: JsonLdIri, resource: Omit<T, "@id">): T {
  const built = { ...resource, "@id": id } as T

  addResource(built)

  return built
}
