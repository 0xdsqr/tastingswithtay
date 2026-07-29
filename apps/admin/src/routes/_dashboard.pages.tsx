import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@twt/react/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/react/components/card"
import { Input } from "@twt/react/components/input"
import { Label } from "@twt/react/components/label"
import { Tabs, TabsList, TabsTrigger } from "@twt/react/components/tabs"
import { Textarea } from "@twt/react/components/textarea"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ConfirmDeleteButton, Field } from "../components/form"
import { ImageUploadField } from "../components/image-upload-field"
import { PageHeader } from "../components/workspace"
import { getSiteDraft, publishSiteDraft, saveSiteDraft } from "../lib/admin-data"
import { type SiteDraft, defaultSiteDraft, mergeSiteDraft } from "../lib/site-draft"
import { useUnsavedChangesGuard } from "../lib/use-unsaved"

export const Route = createFileRoute("/_dashboard/pages")({
  loader: () => getSiteDraft(),
  component: PagesRoute,
})

type SitePageId = "home" | "about" | "gardenAndFlock" | "newsletter"

function PagesRoute(): React.ReactElement {
  const loadedDraft = Route.useLoaderData()
  const initialDraft = mergeSiteDraft(loadedDraft as Partial<SiteDraft> | null)
  const [draft, setDraft] = useState<SiteDraft>(initialDraft)
  const [snapshot, setSnapshot] = useState<string>(() => JSON.stringify(initialDraft))
  const [selectedPage, setSelectedPage] = useState<SitePageId>("home")
  const [isPending, startTransition] = useTransition()

  const isDirty = JSON.stringify(draft) !== snapshot
  useUnsavedChangesGuard(isDirty)

  const saveDraft = () => {
    startTransition(async () => {
      try {
        await saveSiteDraft({ data: { draft } })
        setSnapshot(JSON.stringify(draft))
        toast.success("Draft saved. Publish it when the changes are ready for visitors.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save site draft.")
      }
    })
  }

  const publishDraft = () => {
    startTransition(async () => {
      try {
        await saveSiteDraft({ data: { draft } })
        await publishSiteDraft()
        setSnapshot(JSON.stringify(draft))
        toast.success("Site changes published.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not publish site changes.")
      }
    })
  }

  const updateGardenAndFlock = (field: keyof SiteDraft["gardenAndFlock"], value: string) => {
    setDraft((current) => ({
      ...current,
      gardenAndFlock: { ...current.gardenAndFlock, [field]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        description="Edit the words visitors see on each page, then publish when everything is ready."
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={selectedPage}
            onValueChange={(value) => setSelectedPage(value as SitePageId)}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-4">
              <SitePageTab value="home" label="Home" description="Hero and homepage sections" />
              <SitePageTab
                value="about"
                label="About Tay"
                description="Story, values, and images"
              />
              <SitePageTab
                value="gardenAndFlock"
                label="Garden & Flock"
                description="Page copy and visitor labels"
              />
              <SitePageTab
                value="newsletter"
                label="Newsletter"
                description="Signup section copy"
              />
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="sticky top-4 z-20 flex flex-col gap-3 rounded-lg border bg-background/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">
            {isDirty ? "You have unsaved changes" : "Editing a private draft"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Save your progress at any time. Visitors only see changes after you publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveDraft} disabled={isPending} variant="outline">
            {isPending ? "Working..." : "Save changes"}
          </Button>
          <Button onClick={publishDraft} disabled={isPending}>
            Publish to website
          </Button>
        </div>
      </div>

      <div className="max-w-5xl">
        <Card className={selectedPage === "home" ? undefined : "hidden"}>
          <CardHeader>
            <CardTitle>Homepage copy</CardTitle>
            <CardDescription>
              Fallback messaging and section copy for the homepage. The rotating hero uses your
              featured recipes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Fallback eyebrow">
              <Input
                value={draft.home.heroFallbackEyebrow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackEyebrow: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Fallback title">
              <Input
                value={draft.home.heroFallbackTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Fallback body">
              <Textarea
                rows={4}
                value={draft.home.heroFallbackBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackBody: event.target.value },
                  }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary CTA label">
                <Input
                  value={draft.home.primaryCtaLabel}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, primaryCtaLabel: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Primary CTA link" description="A site path like /about or /recipes.">
                <Input
                  value={draft.home.primaryCtaHref}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, primaryCtaHref: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Secondary CTA label">
                <Input
                  value={draft.home.secondaryCtaLabel}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, secondaryCtaLabel: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Secondary CTA link" description="A site path like /about or /recipes.">
                <Input
                  value={draft.home.secondaryCtaHref}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, secondaryCtaHref: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bento eyebrow">
                <Input
                  value={draft.home.bentoEyebrow}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, bentoEyebrow: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Bento title">
                <Input
                  value={draft.home.bentoTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, bentoTitle: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stories eyebrow">
                <Input
                  value={draft.home.storiesEyebrow}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, storiesEyebrow: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Stories title">
                <Input
                  value={draft.home.storiesTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, storiesTitle: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Empty-state heading">
              <Input
                value={draft.home.storiesEmptyHeading}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, storiesEmptyHeading: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Empty-state body">
              <Textarea
                rows={3}
                value={draft.home.storiesEmptyBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, storiesEmptyBody: event.target.value },
                  }))
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card className={selectedPage === "about" ? undefined : "hidden"}>
          <CardHeader>
            <CardTitle>About page</CardTitle>
            <CardDescription>
              This is the long-form storytelling area for Tay&apos;s voice and page sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="About eyebrow">
              <Input
                value={draft.about.heroEyebrow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, heroEyebrow: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="About title">
              <Input
                value={draft.about.heroTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, heroTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <ImageUploadField
              label="About hero image"
              value={draft.about.heroImage}
              folder="about"
              description="Use this for Tay's main portrait."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, heroImage: value },
                }))
              }
            />
            <Field label="Intro story">
              <Textarea
                rows={8}
                value={draft.about.introBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, introBody: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Philosophy title">
              <Input
                value={draft.about.philosophyTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, philosophyTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Philosophy body">
              <Textarea
                rows={5}
                value={draft.about.philosophyBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, philosophyBody: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Values section title">
              <Input
                value={draft.about.valuesTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, valuesTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <div className="space-y-3">
              <Label>Values cards</Label>
              {draft.about.values.map((item, index) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="mb-3 text-xs text-muted-foreground">Card {index + 1}</div>
                  <div className="grid gap-3">
                    <Input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          about: {
                            ...current.about,
                            values: current.about.values.map((value) =>
                              value.id === item.id
                                ? { ...value, title: event.target.value }
                                : value,
                            ),
                          },
                        }))
                      }
                      placeholder="Title"
                    />
                    <Textarea
                      rows={3}
                      value={item.body}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          about: {
                            ...current.about,
                            values: current.about.values.map((value) =>
                              value.id === item.id ? { ...value, body: event.target.value } : value,
                            ),
                          },
                        }))
                      }
                      placeholder="Body"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Quote text">
                <Textarea
                  rows={4}
                  value={draft.about.quoteText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      about: { ...current.about, quoteText: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Quote author">
                <Input
                  value={draft.about.quoteAuthor}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      about: { ...current.about, quoteAuthor: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <ImageUploadField
              label="Quote image"
              value={draft.about.quoteImage}
              folder="about"
              description="A wide kitchen or ingredient image works best behind the quote section."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, quoteImage: value },
                }))
              }
            />
            <Field label="What you'll find bullets">
              <Textarea
                rows={5}
                value={draft.about.whatsIncludedBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, whatsIncludedBody: event.target.value },
                  }))
                }
              />
            </Field>
            <ImageUploadField
              label="What you'll find image"
              value={draft.about.whatsIncludedImage}
              folder="about"
              description="Use a square supporting photo for the second About image slot."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, whatsIncludedImage: value },
                }))
              }
            />
            <Field label="Connect section body">
              <Textarea
                rows={4}
                value={draft.about.connectBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, connectBody: event.target.value },
                  }))
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card className={selectedPage === "gardenAndFlock" ? undefined : "hidden"}>
          <CardHeader>
            <CardTitle>Garden &amp; Flock page</CardTitle>
            <CardDescription>
              Visitor-facing copy, search metadata, filters, and empty states. Manage the actual
              garden and flock photos in the Garden &amp; Flock section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Page title">
              <Input
                value={draft.gardenAndFlock.heroTitle}
                onChange={(event) => updateGardenAndFlock("heroTitle", event.target.value)}
              />
            </Field>
            <Field label="Page introduction">
              <Textarea
                rows={4}
                value={draft.gardenAndFlock.heroBody}
                onChange={(event) => updateGardenAndFlock("heroBody", event.target.value)}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Browser and sharing title">
                <Input
                  value={draft.gardenAndFlock.metaTitle}
                  onChange={(event) => updateGardenAndFlock("metaTitle", event.target.value)}
                />
              </Field>
              <Field label="Search description">
                <Textarea
                  rows={3}
                  value={draft.gardenAndFlock.metaDescription}
                  onChange={(event) => updateGardenAndFlock("metaDescription", event.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="All filter label">
                <Input
                  value={draft.gardenAndFlock.allFilterLabel}
                  onChange={(event) => updateGardenAndFlock("allFilterLabel", event.target.value)}
                />
              </Field>
              <Field label="Garden filter label">
                <Input
                  value={draft.gardenAndFlock.gardenFilterLabel}
                  onChange={(event) =>
                    updateGardenAndFlock("gardenFilterLabel", event.target.value)
                  }
                />
              </Field>
              <Field label="Flock filter label">
                <Input
                  value={draft.gardenAndFlock.flockFilterLabel}
                  onChange={(event) => updateGardenAndFlock("flockFilterLabel", event.target.value)}
                />
              </Field>
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <div>
                <div className="text-sm font-medium">Empty gallery messages</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  These appear when a visitor selects a view with no published photos.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="All photos heading">
                  <Input
                    value={draft.gardenAndFlock.emptyAllHeading}
                    onChange={(event) =>
                      updateGardenAndFlock("emptyAllHeading", event.target.value)
                    }
                  />
                </Field>
                <Field label="All photos message">
                  <Input
                    value={draft.gardenAndFlock.emptyAllBody}
                    onChange={(event) => updateGardenAndFlock("emptyAllBody", event.target.value)}
                  />
                </Field>
                <Field label="Garden heading">
                  <Input
                    value={draft.gardenAndFlock.emptyGardenHeading}
                    onChange={(event) =>
                      updateGardenAndFlock("emptyGardenHeading", event.target.value)
                    }
                  />
                </Field>
                <Field label="Garden message">
                  <Input
                    value={draft.gardenAndFlock.emptyGardenBody}
                    onChange={(event) =>
                      updateGardenAndFlock("emptyGardenBody", event.target.value)
                    }
                  />
                </Field>
                <Field label="Flock heading">
                  <Input
                    value={draft.gardenAndFlock.emptyFlockHeading}
                    onChange={(event) =>
                      updateGardenAndFlock("emptyFlockHeading", event.target.value)
                    }
                  />
                </Field>
                <Field label="Flock message">
                  <Input
                    value={draft.gardenAndFlock.emptyFlockBody}
                    onChange={(event) => updateGardenAndFlock("emptyFlockBody", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={selectedPage === "newsletter" ? undefined : "hidden"}>
          <CardHeader>
            <CardTitle>Newsletter signup</CardTitle>
            <CardDescription>
              The invitation shown above newsletter signup forms across the public website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Small heading" description="A short introduction above the main title.">
              <Input
                value={draft.newsletter.eyebrow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, eyebrow: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Signup title">
              <Input
                value={draft.newsletter.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, title: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Signup message">
              <Textarea
                rows={4}
                value={draft.newsletter.body}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, body: event.target.value },
                  }))
                }
              />
            </Field>
            <Field
              label="Privacy note"
              description="A brief reassurance shown underneath the signup form."
            >
              <Input
                value={draft.newsletter.privacyNote}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, privacyNote: event.target.value },
                  }))
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Need a clean starting point? Restoring starter copy only changes this draft until you save
          or publish it.
        </p>
        <ConfirmDeleteButton
          label="Restore starter copy"
          title="Replace this draft with the starter website copy?"
          description="Your current draft text is replaced. Nothing changes on the website until you save or publish."
          onConfirm={() => {
            setDraft(defaultSiteDraft)
            toast.success("Starter copy restored. Save or publish when you are ready.")
          }}
        />
      </div>
    </div>
  )
}

function SitePageTab({
  value,
  label,
  description,
}: {
  value: SitePageId
  label: string
  description: string
}): React.ReactElement {
  return (
    <TabsTrigger
      value={value}
      className="h-auto min-h-20 flex-col items-start justify-center whitespace-normal rounded-lg border px-4 py-3 text-left data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5"
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs font-normal leading-relaxed text-muted-foreground">
        {description}
      </span>
    </TabsTrigger>
  )
}
