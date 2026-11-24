import { and, asc, desc, eq } from "@twt/database"
import {
  experimentEntries,
  experimentTags,
  experiments,
  galleryImages,
  recipes,
  siteSettings,
  tags,
  wines,
} from "@twt/database/schema"
import { Context, Effect, Layer } from "effect"
import type {
  Experiment,
  ExperimentDetail,
  GalleryImage,
  Recipe,
  SitePublication,
  Wine,
} from "../domain/content"
import type { DatabaseError } from "../domain/errors"
import { Database } from "./Database"

const sitePublicationKey = "site-publication"

type Page = { readonly limit: number; readonly offset: number }

/** Read access to everything the public site shows. Only published rows are ever returned. */
export class Content extends Context.Service<
  Content,
  {
    listRecipes(
      options: Page & { readonly category: string | undefined },
    ): Effect.Effect<ReadonlyArray<Recipe>, DatabaseError>
    readonly featuredRecipes: Effect.Effect<ReadonlyArray<Recipe>, DatabaseError>
    readonly recipeCategories: Effect.Effect<ReadonlyArray<string>, DatabaseError>
    recipeBySlug(slug: string): Effect.Effect<Recipe | null, DatabaseError>
    listWines(
      options: Page & { readonly type: string | undefined; readonly country: string | undefined },
    ): Effect.Effect<ReadonlyArray<Wine>, DatabaseError>
    wineBySlug(slug: string): Effect.Effect<Wine | null, DatabaseError>
    listExperiments(
      options: Page & { readonly status: string | undefined },
    ): Effect.Effect<ReadonlyArray<Experiment>, DatabaseError>
    experimentBySlug(slug: string): Effect.Effect<ExperimentDetail | null, DatabaseError>
    listGalleryImages(
      options: Page & { readonly category: string | undefined },
    ): Effect.Effect<ReadonlyArray<GalleryImage>, DatabaseError>
    readonly sitePublication: Effect.Effect<SitePublication | null, DatabaseError>
  }
>()("@twt/core/services/Content") {
  static readonly layerNoDeps = Layer.effect(
    Content,
    Effect.gen(function* () {
      const database = yield* Database

      const listRecipes = Effect.fn("Content.listRecipes")(
        (options: Page & { readonly category: string | undefined }) =>
          database.query("recipes.list", (db) =>
            db
              .select()
              .from(recipes)
              .where(
                and(
                  eq(recipes.published, true),
                  options.category ? eq(recipes.category, options.category) : undefined,
                ),
              )
              .orderBy(desc(recipes.createdAt))
              .limit(options.limit)
              .offset(options.offset),
          ),
      )

      const featuredRecipes = database
        .query("recipes.featured", (db) =>
          db
            .select()
            .from(recipes)
            .where(and(eq(recipes.published, true), eq(recipes.featured, true)))
            .orderBy(desc(recipes.createdAt))
            .limit(6),
        )
        .pipe(Effect.withSpan("Content.featuredRecipes"))

      const recipeCategories = database
        .query("recipes.categories", (db) =>
          db
            .selectDistinct({ category: recipes.category })
            .from(recipes)
            .where(eq(recipes.published, true))
            .orderBy(recipes.category),
        )
        .pipe(
          Effect.map((rows) => rows.map((row) => row.category)),
          Effect.withSpan("Content.recipeCategories"),
        )

      const recipeBySlug = Effect.fn("Content.recipeBySlug")((slug: string) =>
        database
          .query("recipes.bySlug", (db) =>
            db
              .select()
              .from(recipes)
              .where(and(eq(recipes.slug, slug), eq(recipes.published, true)))
              .limit(1),
          )
          .pipe(Effect.map((rows) => rows[0] ?? null)),
      )

      const listWines = Effect.fn("Content.listWines")(
        (
          options: Page & {
            readonly type: string | undefined
            readonly country: string | undefined
          },
        ) =>
          database.query("wines.list", (db) =>
            db
              .select()
              .from(wines)
              .where(
                and(
                  eq(wines.published, true),
                  options.type ? eq(wines.type, options.type) : undefined,
                  options.country ? eq(wines.country, options.country) : undefined,
                ),
              )
              .orderBy(desc(wines.createdAt))
              .limit(options.limit)
              .offset(options.offset),
          ),
      )

      const wineBySlug = Effect.fn("Content.wineBySlug")((slug: string) =>
        database
          .query("wines.bySlug", (db) =>
            db
              .select()
              .from(wines)
              .where(and(eq(wines.slug, slug), eq(wines.published, true)))
              .limit(1),
          )
          .pipe(Effect.map((rows) => rows[0] ?? null)),
      )

      const listExperiments = Effect.fn("Content.listExperiments")(
        (options: Page & { readonly status: string | undefined }) =>
          database.query("experiments.list", (db) =>
            db
              .select()
              .from(experiments)
              .where(
                and(
                  eq(experiments.published, true),
                  options.status ? eq(experiments.status, options.status) : undefined,
                ),
              )
              .orderBy(desc(experiments.updatedAt))
              .limit(options.limit)
              .offset(options.offset),
          ),
      )

      const experimentBySlug = Effect.fn("Content.experimentBySlug")(function* (slug: string) {
        const [experiment] = yield* database.query("experiments.bySlug", (db) =>
          db
            .select()
            .from(experiments)
            .where(and(eq(experiments.slug, slug), eq(experiments.published, true)))
            .limit(1),
        )
        if (!experiment) return null

        const [entries, tagRows] = yield* Effect.all(
          [
            database.query("experiments.entries", (db) =>
              db
                .select()
                .from(experimentEntries)
                .where(eq(experimentEntries.experimentId, experiment.id))
                .orderBy(desc(experimentEntries.createdAt)),
            ),
            database.query("experiments.tags", (db) =>
              db
                .select({ tag: tags })
                .from(experimentTags)
                .innerJoin(tags, eq(experimentTags.tagId, tags.id))
                .where(eq(experimentTags.experimentId, experiment.id)),
            ),
          ],
          { concurrency: 2 },
        )

        return { ...experiment, entries, tags: tagRows.map((row) => row.tag) }
      })

      const listGalleryImages = Effect.fn("Content.listGalleryImages")(
        (options: Page & { readonly category: string | undefined }) =>
          database.query("gallery.list", (db) =>
            db
              .select()
              .from(galleryImages)
              .where(
                and(
                  eq(galleryImages.published, true),
                  options.category ? eq(galleryImages.category, options.category) : undefined,
                ),
              )
              .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt))
              .limit(options.limit)
              .offset(options.offset),
          ),
      )

      const sitePublication = database
        .query("site.publication", (db) =>
          db.select().from(siteSettings).where(eq(siteSettings.key, sitePublicationKey)).limit(1),
        )
        .pipe(
          Effect.map((rows) => rows[0]?.value ?? null),
          Effect.withSpan("Content.sitePublication"),
        )

      return Content.of({
        listRecipes,
        featuredRecipes,
        recipeCategories,
        recipeBySlug,
        listWines,
        wineBySlug,
        listExperiments,
        experimentBySlug,
        listGalleryImages,
        sitePublication,
      })
    }),
  )

  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Database.layer))
}
