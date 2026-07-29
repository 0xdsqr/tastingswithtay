import { Badge } from "@twt/react/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@twt/react/components/card"
import { Input } from "@twt/react/components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@twt/react/components/tabs"
import { imageHealthFor } from "../lib/image-health"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}): React.ReactElement {
  return (
    <div>
      <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function EditorWorkspace({
  listHeader,
  listAction,
  searchValue,
  onSearchChange,
  list,
  editor,
  preview,
}: {
  listHeader: string
  listAction: React.ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  list: React.ReactNode
  editor: React.ReactNode
  preview?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{listHeader}</CardTitle>
            {listAction}
          </div>
          {onSearchChange ? (
            <Input
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
            />
          ) : null}
        </CardHeader>
        <CardContent>{list}</CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {preview ? (
            <Tabs defaultValue="edit" className="gap-6">
              <TabsList className="grid w-full grid-cols-2 sm:inline-grid sm:w-auto">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">{editor}</TabsContent>
              <TabsContent value="preview">{preview}</TabsContent>
            </Tabs>
          ) : (
            editor
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function RecordButton({
  active,
  title,
  subtitle,
  meta,
  imageValue,
  onClick,
}: {
  active: boolean
  title: string
  subtitle: string
  meta: string
  imageValue?: string | null
  onClick: () => void
}): React.ReactElement {
  const imageHealth = imageValue === undefined ? null : imageHealthFor(imageValue)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border p-3 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{title}</div>
        {imageHealth ? (
          <Badge
            variant={imageHealth.status === "ready" ? "secondary" : "destructive"}
            className="shrink-0"
          >
            {imageHealth.status === "ready" ? "Image ok" : "Needs image"}
          </Badge>
        ) : null}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      <div className="mt-2 text-xs text-muted-foreground">{meta}</div>
    </button>
  )
}
