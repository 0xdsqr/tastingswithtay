import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@twt/react/components/alert-dialog"
import { Button } from "@twt/react/components/button"
import { Label } from "@twt/react/components/label"
import { Switch } from "@twt/react/components/switch"

export function Field({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}): React.ReactElement {
  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  )
}

export function ConfirmDeleteButton({
  label = "Delete",
  title,
  description,
  disabled,
  onConfirm,
}: {
  label?: string
  title: string
  description: string
  disabled?: boolean
  onConfirm: () => void
}): React.ReactElement {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EditorActions({
  primaryLabel,
  primaryDisabled,
  deleteTitle,
  deleteDescription,
  onDelete,
}: {
  primaryLabel: string
  primaryDisabled: boolean
  deleteTitle?: string
  deleteDescription?: string
  onDelete?: () => void
}): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
      {onDelete ? (
        <ConfirmDeleteButton
          title={deleteTitle ?? "Delete this record?"}
          description={
            deleteDescription ?? "This permanently removes it from the site and cannot be undone."
          }
          disabled={primaryDisabled}
          onConfirm={onDelete}
        />
      ) : null}
    </div>
  )
}
