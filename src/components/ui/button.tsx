import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { isValidElement } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 border bg-clip-padding font-sans font-medium tracking-normal whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[var(--relay-shadow-sm)] hover:bg-[color:var(--relay-accent-strong)] hover:border-[color:var(--relay-accent-strong)]",
        outline:
          "border-border bg-card text-foreground shadow-[var(--relay-shadow-sm)] hover:bg-[color:var(--relay-hover)] hover:border-[color:var(--relay-border-strong)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-[color:var(--relay-hover)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--relay-text-soft)] hover:bg-[color:var(--relay-hover)] hover:text-foreground",
        destructive:
          "border-transparent bg-[color:var(--relay-bad-soft)] text-[color:var(--relay-bad)] hover:border-[color:var(--relay-bad)]",
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[34px] rounded-lg px-3 text-[13px]",
        xs: "h-7 rounded-md px-2.5 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-4 text-sm",
        icon: "size-[34px] rounded-lg p-0",
        "icon-xs": "size-7 rounded-md p-0",
        "icon-sm": "size-8 rounded-md p-0",
        "icon-lg": "size-10 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const rendersNativeButton =
    isValidElement(render) && render.type === "button"
  const resolvedNativeButton =
    nativeButton ?? (render ? rendersNativeButton : true)

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={resolvedNativeButton}
      render={render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
