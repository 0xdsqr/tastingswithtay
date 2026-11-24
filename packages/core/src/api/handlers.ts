import { Effect, Layer } from "effect"
import { HttpServerRequest } from "effect/http"
import { HttpApiBuilder } from "effect/http-api"
import { Content } from "../services/Content"
import { RateLimiter } from "../services/RateLimiter"
import { Subscribers } from "../services/Subscribers"
import { Api } from "./Api"

const page = (
  query: { readonly limit?: number | undefined; readonly offset?: number | undefined },
  defaultLimit: number,
) => ({
  limit: query.limit ?? defaultLimit,
  offset: query.offset ?? 0,
})

// Database failures are unexpected here, so they surface as a 500 with no detail.

const RecipesHandlers = HttpApiBuilder.group(
  Api,
  "recipes",
  Effect.fn(function* (handlers) {
    const content = yield* Content
    return handlers.handleAll({
      list: ({ query }) =>
        Effect.orDie(content.listRecipes({ ...page(query, 20), category: query.category })),
      featured: () => Effect.orDie(content.featuredRecipes),
      categories: () => Effect.orDie(content.recipeCategories),
      bySlug: ({ params }) => Effect.orDie(content.recipeBySlug(params.slug)),
    })
  }),
)

const WinesHandlers = HttpApiBuilder.group(
  Api,
  "wines",
  Effect.fn(function* (handlers) {
    const content = yield* Content
    return handlers.handleAll({
      list: ({ query }) =>
        Effect.orDie(
          content.listWines({ ...page(query, 20), type: query.type, country: query.country }),
        ),
      bySlug: ({ params }) => Effect.orDie(content.wineBySlug(params.slug)),
    })
  }),
)

const ExperimentsHandlers = HttpApiBuilder.group(
  Api,
  "experiments",
  Effect.fn(function* (handlers) {
    const content = yield* Content
    return handlers.handleAll({
      list: ({ query }) =>
        Effect.orDie(content.listExperiments({ ...page(query, 20), status: query.status })),
      bySlug: ({ params }) => Effect.orDie(content.experimentBySlug(params.slug)),
    })
  }),
)

const GalleryHandlers = HttpApiBuilder.group(
  Api,
  "gallery",
  Effect.fn(function* (handlers) {
    const content = yield* Content
    return handlers.handleAll({
      list: ({ query }) =>
        Effect.orDie(content.listGalleryImages({ ...page(query, 50), category: query.category })),
    })
  }),
)

const SiteHandlers = HttpApiBuilder.group(
  Api,
  "site",
  Effect.fn(function* (handlers) {
    const content = yield* Content
    return handlers.handleAll({
      published: () => Effect.orDie(content.sitePublication),
    })
  }),
)

const requestHeaders = Effect.map(
  HttpServerRequest.HttpServerRequest,
  (request) => new Headers(request.headers),
)

const SubscribersHandlers = HttpApiBuilder.group(
  Api,
  "subscribers",
  Effect.fn(function* (handlers) {
    const subscribers = yield* Subscribers
    const rateLimiter = yield* RateLimiter

    return handlers.handleAll({
      subscribe: Effect.fn(function* ({ payload }) {
        yield* rateLimiter
          .enforce({
            headers: yield* requestHeaders,
            action: "subscribers.subscribe",
            limit: 5,
            window: "1 hour",
          })
          .pipe(Effect.catchTag("DatabaseError", Effect.die))
        yield* Effect.orDie(subscribers.subscribe(payload.email))
        return { message: "If eligible, this address is now subscribed." }
      }),
      unsubscribe: Effect.fn(function* ({ payload }) {
        yield* rateLimiter
          .enforce({
            headers: yield* requestHeaders,
            action: "subscribers.unsubscribe",
            limit: 20,
            window: "1 hour",
          })
          .pipe(Effect.catchTag("DatabaseError", Effect.die))
        yield* Effect.orDie(subscribers.unsubscribe(payload.token))
        return { message: "Subscription preference updated." }
      }),
    })
  }),
)

/** Handlers for every group, still requiring the services they use. */
export const ApiHandlers = Layer.mergeAll(
  RecipesHandlers,
  WinesHandlers,
  ExperimentsHandlers,
  GalleryHandlers,
  SiteHandlers,
  SubscribersHandlers,
)

/** Every route of the public API, ready to mount once its services are provided. */
export const ApiRoutes = HttpApiBuilder.layer(Api).pipe(Layer.provide(ApiHandlers))
