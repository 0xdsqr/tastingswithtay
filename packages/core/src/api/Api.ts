/**
 * The public HTTP API. This module is shared with browser code through the
 * typed client, so it must only import schemas — never server implementations.
 */
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/http-api"
import {
  Experiment,
  ExperimentDetail,
  ExperimentStatus,
  GalleryCategory,
  GalleryImage,
  Recipe,
  SitePublication,
  Slug,
  Wine,
  WineType,
} from "../domain/content"
import { RateLimited } from "../domain/errors"

const limit = Schema.optional(Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 100 })))
const offset = Schema.optional(Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 10_000 })))
const filterText = Schema.optional(
  Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(100)),
)

const Acknowledgement = Schema.Struct({ message: Schema.String })

export class RecipesApi extends HttpApiGroup.make("recipes")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: { category: filterText, limit, offset },
      success: Schema.Array(Recipe),
    }),
    HttpApiEndpoint.get("featured", "/featured", { success: Schema.Array(Recipe) }),
    HttpApiEndpoint.get("categories", "/categories", { success: Schema.Array(Schema.String) }),
    HttpApiEndpoint.get("bySlug", "/by-slug/:slug", {
      params: { slug: Slug },
      success: Schema.NullOr(Recipe),
    }),
  )
  .prefix("/recipes") {}

export class WinesApi extends HttpApiGroup.make("wines")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: { type: Schema.optional(WineType), country: filterText, limit, offset },
      success: Schema.Array(Wine),
    }),
    HttpApiEndpoint.get("bySlug", "/by-slug/:slug", {
      params: { slug: Slug },
      success: Schema.NullOr(Wine),
    }),
  )
  .prefix("/wines") {}

export class ExperimentsApi extends HttpApiGroup.make("experiments")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: { status: Schema.optional(ExperimentStatus), limit, offset },
      success: Schema.Array(Experiment),
    }),
    HttpApiEndpoint.get("bySlug", "/by-slug/:slug", {
      params: { slug: Slug },
      success: Schema.NullOr(ExperimentDetail),
    }),
  )
  .prefix("/experiments") {}

export class GalleryApi extends HttpApiGroup.make("gallery")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: { category: Schema.optional(GalleryCategory), limit, offset },
      success: Schema.Array(GalleryImage),
    }),
  )
  .prefix("/gallery") {}

export class SiteApi extends HttpApiGroup.make("site")
  .add(HttpApiEndpoint.get("published", "/published", { success: Schema.NullOr(SitePublication) }))
  .prefix("/site") {}

export class SubscribersApi extends HttpApiGroup.make("subscribers")
  .add(
    HttpApiEndpoint.post("subscribe", "/", {
      payload: Schema.Struct({
        email: Schema.String.check(
          Schema.isMaxLength(255),
          Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        ),
      }),
      success: Acknowledgement,
      error: RateLimited,
    }),
    HttpApiEndpoint.post("unsubscribe", "/unsubscribe", {
      payload: Schema.Struct({ token: Schema.String.check(Schema.isUUID()) }),
      success: Acknowledgement,
      error: RateLimited,
    }),
  )
  .prefix("/subscribers") {}

export const apiPrefix = "/api/v1"

export class Api extends HttpApi.make("tastingswithtay")
  .add(RecipesApi)
  .add(WinesApi)
  .add(ExperimentsApi)
  .add(GalleryApi)
  .add(SiteApi)
  .add(SubscribersApi)
  .prefix(apiPrefix) {}
