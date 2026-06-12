import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm text-base font-normal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        destructive_secondary:
            "bg-destructive/10 text-destructive hover:bg-destructive/90 hover:text-destructive-foreground focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-primary/20 hover:text-primary dark:bg-background dark:border-input dark:hover:bg-primary/30",
        secondary:
          "bg-accent/20 text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
        ghost:
          "hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary/30",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "bg-transparent hover:bg-transparent hover:text-primary"
      },
      size: {
        default: "h-10 px-4 py-4",
        sm: "h-8 gap-1.5 px-2",
        lg: "h-14 px-6 py-4",
        icon: "size-8",
        "icon-sm": "size-6",
        "icon-lg": "size-10",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
