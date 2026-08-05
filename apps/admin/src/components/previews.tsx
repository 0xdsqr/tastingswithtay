import { Badge } from "@twt/react/components/badge"
import {
  type IngredientGroup,
  capitalize,
  humanizeExperimentStatus,
  parseIngredientGroups,
  parseInstructionLines,
  splitPreviewLines,
} from "../lib/format"
import { imageHealthClassName, imageHealthFor, imagePreviewSrcFor } from "../lib/image-health"

function PreviewSurface({
  image,
  title,
  children,
}: {
  image: string
  title: string
  children: React.ReactNode
}): React.ReactElement {
  const imageHealth = imageHealthFor(image)
  const previewSrc = imageHealth.status === "ready" ? imagePreviewSrcFor(image) : ""

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-md border bg-background">
        {previewSrc ? (
          <div className="h-56 bg-muted sm:h-72">
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div
            className={`flex flex-col gap-1 border-b px-5 py-4 text-sm sm:flex-row sm:items-center sm:gap-3 ${imageHealthClassName(imageHealth.status)}`}
          >
            <span className="font-semibold">{imageHealth.label}</span>
            <span>{imageHealth.description}</span>
          </div>
        )}
        <div className="space-y-4 p-5">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}

function PreviewText({ title, body }: { title: string; body: string }): React.ReactElement {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function PreviewList({
  title,
  items,
  empty,
  ordered = false,
}: {
  title: string
  items: string[]
  empty: string
  ordered?: boolean
}): React.ReactElement {
  const ListElement = ordered ? "ol" : "ul"

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length > 0 ? (
        <ListElement
          className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}
        >
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="text-sm text-muted-foreground">
              {item}
            </li>
          ))}
        </ListElement>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

type RecipePreviewForm = {
  title: string
  description: string
  category: string
  difficulty: string
  prepTime: number | null
  cookTime: number | null
  servings: number | null
  image: string
  ingredientsText: string
  instructionsText: string
  tipsText: string
}

function RecipeIngredients({ groups }: { groups: IngredientGroup[] }): React.ReactElement {
  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">Add ingredients to preview them.</p>
  }

  return (
    <div className="space-y-5">
      {groups.map((group, groupIndex) => (
        <section key={`${group.group ?? "ingredients"}-${groupIndex}`} className="space-y-2">
          {group.group ? (
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.group}
            </h4>
          ) : null}
          <ul className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="flex items-start gap-2 text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function RecipeInstructions({ items }: { items: string[] }): React.ReactElement {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Add steps to preview them.</p>
  }

  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {index + 1}
          </span>
          <p className="pt-0.5 text-sm leading-relaxed">{item}</p>
        </li>
      ))}
    </ol>
  )
}

export function RecipePreview({ form }: { form: RecipePreviewForm }): React.ReactElement {
  const ingredientGroups = parseIngredientGroups(form.ingredientsText)
  const instructions = parseInstructionLines(form.instructionsText)
  const tips = splitPreviewLines(form.tipsText)
  const totalTime = (form.prepTime ?? 0) + (form.cookTime ?? 0)

  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled recipe"}>
      <p className="text-sm text-muted-foreground">{form.description || "No description yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{form.category || "No category"}</Badge>
        <Badge variant="outline">{form.difficulty}</Badge>
        {totalTime > 0 ? <Badge variant="outline">{totalTime} min total</Badge> : null}
        {form.prepTime ? <Badge variant="outline">{form.prepTime} min prep</Badge> : null}
        {form.cookTime ? <Badge variant="outline">{form.cookTime} min cook</Badge> : null}
        {form.servings ? <Badge variant="outline">Serves {form.servings}</Badge> : null}
      </div>
      <div className="grid gap-8 border-t pt-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-semibold">Ingredients</h3>
          <RecipeIngredients groups={ingredientGroups} />
        </section>
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-semibold">Instructions</h3>
          <RecipeInstructions items={instructions} />
          {tips.length > 0 ? (
            <aside className="space-y-3 rounded-lg bg-muted p-4">
              <h3 className="font-serif text-lg font-semibold">Tips & notes</h3>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={`${tip}-${index}`} className="flex items-start gap-2 text-sm">
                    <span className="text-accent">•</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </section>
      </div>
    </PreviewSurface>
  )
}

type WinePreviewForm = {
  name: string
  winery: string
  region: string
  country: string
  type: string
  vintage: number | null
  rating: number | null
  priceRange: string | null
  notes: string
  aromasText: string
  pairingsText: string
  image: string
}

export function WinePreview({ form }: { form: WinePreviewForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.name || "Untitled wine"}>
      <p className="text-sm text-muted-foreground">
        {[form.winery, form.region, form.country].filter(Boolean).join(" • ") ||
          "Add winery and region details."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{form.type}</Badge>
        {form.vintage ? <Badge variant="outline">{form.vintage}</Badge> : null}
        {form.rating ? <Badge variant="outline">{form.rating}/5</Badge> : null}
        {form.priceRange ? <Badge variant="outline">{form.priceRange}</Badge> : null}
      </div>
      {form.notes ? <p className="text-sm leading-relaxed">{form.notes}</p> : null}
      <PreviewList
        title="Aromas"
        items={splitPreviewLines(form.aromasText)}
        empty="Aromas are optional."
      />
      <PreviewList
        title="Pairings"
        items={splitPreviewLines(form.pairingsText)}
        empty="Pairings are optional."
      />
    </PreviewSurface>
  )
}

type ExperimentPreviewForm = {
  title: string
  description: string
  status: string
  published: boolean
  hypothesis: string
  result: string
  image: string
  entries: Array<{ id?: string; entryType: string; content: string; imagesText: string }>
}

export function ExperimentPreview({ form }: { form: ExperimentPreviewForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled experiment"}>
      <p className="text-sm text-muted-foreground">{form.description || "No description yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{humanizeExperimentStatus(form.status)}</Badge>
        {form.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
      </div>
      {form.hypothesis ? <PreviewText title="Hypothesis" body={form.hypothesis} /> : null}
      {form.result ? <PreviewText title="Result" body={form.result} /> : null}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Timeline</h3>
        {form.entries.map((entry, index) => (
          <div key={entry.id ?? index} className="rounded-md border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {humanizeExperimentStatus(entry.entryType)}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{entry.content || "No entry text yet."}</p>
            <PreviewList
              title="Images"
              items={splitPreviewLines(entry.imagesText)}
              empty="No entry images."
            />
          </div>
        ))}
      </div>
    </PreviewSurface>
  )
}

type GalleryPreviewForm = {
  title: string
  caption: string
  category: string
  takenAt: string
  published: boolean
  image: string
}

export function GalleryPreview({ form }: { form: GalleryPreviewForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled image"}>
      <p className="text-sm text-muted-foreground">{form.caption || "No caption yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{capitalize(form.category)}</Badge>
        {form.takenAt ? <Badge variant="outline">{form.takenAt}</Badge> : null}
        {form.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
      </div>
    </PreviewSurface>
  )
}
