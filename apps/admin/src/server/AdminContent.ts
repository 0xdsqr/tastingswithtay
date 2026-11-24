import type { DatabaseError } from "@twt/core/domain/errors"
import { Database } from "@twt/core/services/Database"
import { desc, eq } from "@twt/database"
import {
  type Experiment,
  type ExperimentEntry,
  type GalleryImage,
  type Recipe,
  type Wine,
  adminAuditLog,
  experimentEntries,
  experiments,
  galleryImages,
  recipes,
  wines,
} from "@twt/database/schema"
import { Context, Effect, Layer } from "effect"
import { CurrentAdmin } from "./AdminAccess"
import { AdminError } from "./errors"
import {
  emptyToUndefined,
  imageFor,
  parseIngredients,
  parseInstructions,
  parseStringList,
  requireManagedImage,
  requireSlug,
} from "./normalize"
import type { DeleteInput, ExperimentInput, GalleryInput, RecipeInput, WineInput } from "./schemas"
import { type Transaction, transaction } from "./transaction"

export type ExperimentWithEntries = Experiment & { entries: Array<ExperimentEntry> }

type Failure = AdminError | DatabaseError

const audit = (
  tx: Transaction,
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> = {},
) => tx.insert(adminAuditLog).values({ actorUserId, action, targetType, targetId, metadata })

/** Editing of recipes, wines, experiments, and gallery images. Every write is audited. */
export class AdminContent extends Context.Service<
  AdminContent,
  {
    readonly listRecipes: Effect.Effect<Array<Recipe>, DatabaseError>
    readonly listWines: Effect.Effect<Array<Wine>, DatabaseError>
    readonly listExperiments: Effect.Effect<Array<ExperimentWithEntries>, DatabaseError>
    readonly listGalleryImages: Effect.Effect<Array<GalleryImage>, DatabaseError>
    saveRecipe(input: RecipeInput): Effect.Effect<Recipe, Failure, CurrentAdmin>
    saveWine(input: WineInput): Effect.Effect<Wine, Failure, CurrentAdmin>
    saveExperiment(
      input: ExperimentInput,
    ): Effect.Effect<ExperimentWithEntries, Failure, CurrentAdmin>
    saveGalleryImage(input: GalleryInput): Effect.Effect<GalleryImage, Failure, CurrentAdmin>
    deleteRecord(
      input: DeleteInput,
    ): Effect.Effect<{ success: true } & DeleteInput, Failure, CurrentAdmin>
  }
>()("admin/server/AdminContent") {
  static readonly layerNoDeps = Layer.effect(
    AdminContent,
    Effect.gen(function* () {
      const database = yield* Database
      const inTransaction = <A>(operation: string, run: (tx: Transaction) => Promise<A>) =>
        Effect.provideService(transaction(operation, run), Database, database)

      const listRecipes = database.query("admin.recipes.list", (db) =>
        db.select().from(recipes).orderBy(desc(recipes.updatedAt)),
      )

      const listWines = database.query("admin.wines.list", (db) =>
        db.select().from(wines).orderBy(desc(wines.updatedAt)),
      )

      const listGalleryImages = database.query("admin.gallery.list", (db) =>
        db.select().from(galleryImages).orderBy(desc(galleryImages.updatedAt)),
      )

      const listExperiments = Effect.gen(function* () {
        const [experimentRows, entryRows] = yield* Effect.all(
          [
            database.query("admin.experiments.list", (db) =>
              db.select().from(experiments).orderBy(desc(experiments.updatedAt)),
            ),
            database.query("admin.experiments.entries", (db) =>
              db.select().from(experimentEntries).orderBy(desc(experimentEntries.createdAt)),
            ),
          ],
          { concurrency: 2 },
        )
        return experimentRows.map((experiment) => ({
          ...experiment,
          entries: entryRows.filter((entry) => entry.experimentId === experiment.id),
        }))
      }).pipe(Effect.withSpan("AdminContent.listExperiments"))

      const saveRecipe = Effect.fn("AdminContent.saveRecipe")(function* (input: RecipeInput) {
        const actor = yield* CurrentAdmin
        const values = {
          title: input.title,
          slug: yield* requireSlug(input.slug || input.title),
          description: input.description,
          category: input.category,
          difficulty: input.difficulty,
          prepTime: input.prepTime ?? null,
          cookTime: input.cookTime ?? null,
          servings: input.servings ?? null,
          ingredients: yield* parseIngredients(input.ingredientsText),
          instructions: yield* parseInstructions(input.instructionsText),
          tips: parseStringList(input.tipsText),
          image: yield* imageFor(input.published, input.image, "Recipe hero image"),
          published: input.published,
          featured: input.featured,
        }

        return yield* inTransaction("recipes.save", async (tx) => {
          const [saved] = input.id
            ? await tx.update(recipes).set(values).where(eq(recipes.id, input.id)).returning()
            : await tx.insert(recipes).values(values).returning()
          if (!saved) {
            throw new AdminError({
              message: input.id ? "Recipe not found." : "Recipe could not be created.",
            })
          }
          await audit(
            tx,
            actor.id,
            input.id ? "recipe.update" : "recipe.create",
            "recipe",
            saved.id,
            {
              published: saved.published,
            },
          )
          return saved
        })
      })

      const saveWine = Effect.fn("AdminContent.saveWine")(function* (input: WineInput) {
        const actor = yield* CurrentAdmin
        const values = {
          name: input.name,
          slug: yield* requireSlug(input.slug || input.name),
          winery: input.winery,
          region: emptyToUndefined(input.region),
          country: emptyToUndefined(input.country),
          vintage: input.vintage ?? null,
          type: input.type,
          grapes: emptyToUndefined(input.grapes),
          rating: input.rating ?? null,
          notes: emptyToUndefined(input.notes),
          aromas: parseStringList(input.aromasText),
          pairings: parseStringList(input.pairingsText),
          priceRange: input.priceRange ?? null,
          occasion: emptyToUndefined(input.occasion),
          image: yield* imageFor(input.published, input.image, "Wine image"),
          published: input.published,
          featured: input.featured,
        }

        return yield* inTransaction("wines.save", async (tx) => {
          const [saved] = input.id
            ? await tx.update(wines).set(values).where(eq(wines.id, input.id)).returning()
            : await tx.insert(wines).values(values).returning()
          if (!saved) {
            throw new AdminError({
              message: input.id ? "Wine not found." : "Wine could not be created.",
            })
          }
          await audit(tx, actor.id, input.id ? "wine.update" : "wine.create", "wine", saved.id, {
            published: saved.published,
          })
          return saved
        })
      })

      const saveExperiment = Effect.fn("AdminContent.saveExperiment")(function* (
        input: ExperimentInput,
      ) {
        const actor = yield* CurrentAdmin
        const values = {
          title: input.title,
          slug: yield* requireSlug(input.slug || input.title),
          description: input.description,
          status: input.status,
          hypothesis: emptyToUndefined(input.hypothesis),
          result: emptyToUndefined(input.result),
          recipeId: input.recipeId ?? null,
          image: yield* imageFor(input.published, input.image, "Experiment hero image"),
          published: input.published,
          featured: input.featured,
        }
        const entries = yield* Effect.forEach(input.entries, (entry) =>
          Effect.map(
            Effect.forEach(parseStringList(entry.imagesText), (image) =>
              requireManagedImage(image, "Experiment entry image"),
            ),
            (images) => ({
              content: entry.content,
              entryType: entry.entryType,
              images,
              sortOrder: entry.sortOrder,
            }),
          ),
        )

        return yield* inTransaction("experiments.save", async (tx) => {
          const [saved] = input.id
            ? await tx
                .update(experiments)
                .set(values)
                .where(eq(experiments.id, input.id))
                .returning()
            : await tx.insert(experiments).values(values).returning()
          if (!saved) {
            throw new AdminError({
              message: input.id ? "Experiment not found." : "Experiment could not be created.",
            })
          }

          // Entries are replaced wholesale: the form always submits the full timeline.
          await tx.delete(experimentEntries).where(eq(experimentEntries.experimentId, saved.id))
          if (entries.length > 0) {
            await tx
              .insert(experimentEntries)
              .values(entries.map((entry) => ({ ...entry, experimentId: saved.id })))
          }
          const savedEntries = await tx
            .select()
            .from(experimentEntries)
            .where(eq(experimentEntries.experimentId, saved.id))
            .orderBy(desc(experimentEntries.createdAt))

          await audit(
            tx,
            actor.id,
            input.id ? "experiment.update" : "experiment.create",
            "experiment",
            saved.id,
            { published: saved.published },
          )
          return { ...saved, entries: savedEntries }
        })
      })

      const saveGalleryImage = Effect.fn("AdminContent.saveGalleryImage")(function* (
        input: GalleryInput,
      ) {
        const actor = yield* CurrentAdmin
        const values = {
          title: emptyToUndefined(input.title),
          caption: emptyToUndefined(input.caption),
          image: (yield* imageFor(input.published, input.image, "Gallery image")) ?? "",
          category: input.category,
          sortOrder: input.sortOrder,
          published: input.published,
          featured: input.featured,
          takenAt: input.takenAt ? new Date(input.takenAt) : null,
        }

        return yield* inTransaction("gallery.save", async (tx) => {
          const [saved] = input.id
            ? await tx
                .update(galleryImages)
                .set(values)
                .where(eq(galleryImages.id, input.id))
                .returning()
            : await tx.insert(galleryImages).values(values).returning()
          if (!saved) {
            throw new AdminError({
              message: input.id
                ? "Gallery image not found."
                : "Gallery image could not be created.",
            })
          }
          await audit(
            tx,
            actor.id,
            input.id ? "gallery.update" : "gallery.create",
            "gallery",
            saved.id,
            { published: saved.published },
          )
          return saved
        })
      })

      const tables = {
        recipe: recipes,
        wine: wines,
        experiment: experiments,
        gallery: galleryImages,
      } as const

      const deleteRecord = Effect.fn("AdminContent.deleteRecord")(function* (input: DeleteInput) {
        const actor = yield* CurrentAdmin
        const table = tables[input.kind]

        return yield* inTransaction(`${input.kind}.delete`, async (tx) => {
          const [deleted] = await tx
            .delete(table)
            .where(eq(table.id, input.id))
            .returning({ id: table.id })
          if (!deleted) throw new AdminError({ message: `${input.kind} not found.` })

          await audit(tx, actor.id, `${input.kind}.delete`, input.kind, input.id)
          return { success: true as const, id: input.id, kind: input.kind }
        })
      })

      return AdminContent.of({
        listRecipes,
        listWines,
        listExperiments,
        listGalleryImages,
        saveRecipe,
        saveWine,
        saveExperiment,
        saveGalleryImage,
        deleteRecord,
      })
    }),
  )
}
