import { assert, layer } from "@effect/vitest"
import { Context, Effect, Layer, Ref } from "effect"
import { HttpServer } from "effect/http"
import { HttpApiTest } from "effect/http-api"
import type { Recipe } from "../domain/content"
import { RateLimited } from "../domain/errors"
import { Content } from "../services/Content"
import { RateLimiter } from "../services/RateLimiter"
import { Subscribers } from "../services/Subscribers"
import { Api } from "./Api"
import { ApiHandlers } from "./handlers"

const recipe: Recipe = {
  id: "5dd5d80b-192a-4a69-9d47-39307c8a27d6",
  title: "Honey Glazed Salmon",
  slug: "honey-glazed-salmon",
  description: "Weeknight salmon",
  category: "Dinner",
  difficulty: "Easy",
  prepTime: 10,
  cookTime: null,
  servings: 2,
  ingredients: [{ group: "Glaze", items: ["honey", "soy"] }, { items: ["salmon"] }],
  instructions: [{ step: 1, text: "Glaze and roast" }],
  tips: [],
  image: null,
  published: true,
  featured: true,
  viewCount: 3,
  createdAt: new Date("2026-01-02T03:04:05.000Z"),
  updatedAt: new Date("2026-02-03T04:05:06.000Z"),
}

type Calls = {
  readonly listRecipes: Array<{ limit: number; offset: number; category: string | undefined }>
  readonly subscribed: Array<string>
  readonly rateLimited: boolean
}

class TestState extends Context.Service<TestState, Ref.Ref<Calls>>()("test/TestState") {
  static readonly layer = Layer.effect(
    TestState,
    Ref.make<Calls>({ listRecipes: [], subscribed: [], rateLimited: false }),
  )
}

const empty = Effect.succeed([])

const ContentTest = Layer.effect(
  Content,
  Effect.gen(function* () {
    const state = yield* TestState
    return Content.of({
      listRecipes: (options) =>
        Ref.update(state, (calls) => ({
          ...calls,
          listRecipes: [...calls.listRecipes, options],
        })).pipe(Effect.as([recipe])),
      featuredRecipes: Effect.succeed([recipe]),
      recipeCategories: Effect.succeed(["Dinner"]),
      recipeBySlug: (slug) => Effect.succeed(slug === recipe.slug ? recipe : null),
      listWines: () => empty,
      wineBySlug: () => Effect.succeed(null),
      listExperiments: () => empty,
      experimentBySlug: () => Effect.succeed(null),
      listGalleryImages: () => empty,
      sitePublication: Effect.succeed({ home: { heroTitle: "Hello" } }),
    })
  }),
)

const SubscribersTest = Layer.effect(
  Subscribers,
  Effect.gen(function* () {
    const state = yield* TestState
    return Subscribers.of({
      subscribe: (email) =>
        Ref.update(state, (calls) => ({ ...calls, subscribed: [...calls.subscribed, email] })),
      unsubscribe: () => Effect.void,
    })
  }),
)

const RateLimiterTest = Layer.effect(
  RateLimiter,
  Effect.gen(function* () {
    const state = yield* TestState
    return RateLimiter.of({
      enforce: () =>
        Effect.flatMap(Ref.get(state), (calls) =>
          calls.rateLimited
            ? Effect.fail(new RateLimited({ message: "Slow down", retryAfterMs: 1_000 }))
            : Effect.void,
        ),
    })
  }),
)

const TestLayer = ApiHandlers.pipe(
  Layer.provide([ContentTest, SubscribersTest, RateLimiterTest]),
  Layer.provideMerge(TestState.layer),
  Layer.merge(HttpServer.layerServices),
)

const makeClient = HttpApiTest.groups(Api, ["recipes", "site", "subscribers"])

layer(TestLayer)("public API", (it) => {
  it.effect("lists recipes with default paging and round-trips dates", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const state = yield* TestState

      const recipes = yield* client.recipes.list({ query: { category: "Dinner" } })

      assert.deepStrictEqual(recipes, [recipe])
      assert.instanceOf(recipes[0]?.createdAt, Date)
      assert.deepStrictEqual((yield* Ref.get(state)).listRecipes.at(-1), {
        limit: 20,
        offset: 0,
        category: "Dinner",
      })
    }),
  )

  it.effect("rejects out-of-range paging before reaching the service", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const state = yield* TestState
      const before = (yield* Ref.get(state)).listRecipes.length

      const result = yield* Effect.exit(client.recipes.list({ query: { limit: 500 } }))

      assert.isTrue(result._tag === "Failure")
      assert.strictEqual((yield* Ref.get(state)).listRecipes.length, before)
    }),
  )

  it.effect("returns null for an unknown slug instead of failing", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      assert.deepStrictEqual(
        yield* client.recipes.bySlug({ params: { slug: recipe.slug } }),
        recipe,
      )
      assert.isNull(yield* client.recipes.bySlug({ params: { slug: "missing" } }))
    }),
  )

  it.effect("serves the published site copy as free-form JSON", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      assert.deepStrictEqual(yield* client.site.published(), { home: { heroTitle: "Hello" } })
    }),
  )

  it.effect("subscribes an address and answers without confirming it exists", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const state = yield* TestState

      const response = yield* client.subscribers.subscribe({ payload: { email: "a@example.com" } })

      assert.strictEqual(response.message, "If eligible, this address is now subscribed.")
      assert.include((yield* Ref.get(state)).subscribed, "a@example.com")
    }),
  )

  it.effect("rejects malformed addresses", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const result = yield* Effect.exit(
        client.subscribers.subscribe({ payload: { email: "not-an-address" } }),
      )
      assert.isTrue(result._tag === "Failure")
    }),
  )

  it.effect("surfaces rate limiting as a typed error and skips the write", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const state = yield* TestState
      yield* Ref.update(state, (calls) => ({ ...calls, rateLimited: true, subscribed: [] }))

      const error = yield* Effect.flip(
        client.subscribers.subscribe({ payload: { email: "b@example.com" } }),
      )

      assert.strictEqual(error._tag, "RateLimited")
      assert.deepStrictEqual((yield* Ref.get(state)).subscribed, [])
    }),
  )
})
