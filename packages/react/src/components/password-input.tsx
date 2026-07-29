import { Eye, EyeOff } from "lucide-react"
import { type ComponentProps, type ReactElement, useState } from "react"

import { cn } from "../lib/utils"
import { Button } from "./button"
import { Input } from "./input"

function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">): ReactElement {
  const [isVisible, setIsVisible] = useState(false)
  const label = isVisible ? "Hide password" : "Show password"

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-11", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground absolute right-1 top-1/2 -translate-y-1/2"
        aria-label={label}
        aria-pressed={isVisible}
        title={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  )
}

export { PasswordInput }
