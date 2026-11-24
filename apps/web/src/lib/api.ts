/**
 * The typed API client, wrapped as TanStack Query options for loaders and as
 * plain promises for form submissions. Runs on the server during SSR and in
 * the browser afterwards.
 */
import { queryOptions } from "@tanstack/react-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { makeApiClient } from "@twt/core/api/client"
import { ProcessEnvConfig, internalApiBaseUrl } from "@twt/core/config"
import { Effect } from "effect"

// The browser calls its own origin; server rendering goes through the loopback address.
// The server branch (and its config import) is compiled out of the browser bundle.
const baseUrl = createIsomorphicFn()
  .server(() =>
    Effect.runSync(internalApiBaseUrl.pipe(Effect.provide(ProcessEnvConfig), Effect.orDie)),
  )
  .client(() => "")
const client = Effect.runSync(makeApiClient(baseUrl()))

const query = <A, E>(key: ReadonlyArray<unknown>, effect: Effect.Effect<A, E>) =>
  queryOptions({ queryKey: key, queryFn: () => Effect.runPromise(effect) })

type Recipes = Parameters<typeof client.recipes.list>[0]["query"]
type Wines = Parameters<typeof client.wines.list>[0]["query"]
type Experiments = Parameters<typeof client.experiments.list>[0]["query"]
type Gallery = Parameters<typeof client.gallery.list>[0]["query"]

export const api = {
  recipes: {
    list: (filter: Recipes = {}) =>
      query(["recipes", "list", filter], client.recipes.list({ query: filter })),
    featured: () => query(["recipes", "featured"], client.recipes.featured()),
    categories: () => query(["recipes", "categories"], client.recipes.categories()),
    bySlug: (slug: string) =>
      query(["recipes", "bySlug", slug], client.recipes.bySlug({ params: { slug } })),
  },
  wines: {
    list: (filter: Wines = {}) =>
      query(["wines", "list", filter], client.wines.list({ query: filter })),
    bySlug: (slug: string) =>
      query(["wines", "bySlug", slug], client.wines.bySlug({ params: { slug } })),
  },
  experiments: {
    list: (filter: Experiments = {}) =>
      query(["experiments", "list", filter], client.experiments.list({ query: filter })),
    bySlug: (slug: string) =>
      query(["experiments", "bySlug", slug], client.experiments.bySlug({ params: { slug } })),
  },
  gallery: {
    list: (filter: Gallery = {}) =>
      query(["gallery", "list", filter], client.gallery.list({ query: filter })),
  },
  site: {
    published: () => query(["site", "published"], client.site.published()),
  },
  subscribers: {
    subscribe: (email: string) =>
      Effect.runPromise(client.subscribers.subscribe({ payload: { email } })),
    unsubscribe: (token: string) =>
      Effect.runPromise(client.subscribers.unsubscribe({ payload: { token } })),
  },
}

export type Api = typeof api
