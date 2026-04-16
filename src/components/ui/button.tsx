import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-black transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 uppercase tracking-tighter",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-black shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:bg-[#26d968] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]",
        outline:
          "border border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 backdrop-blur-md",
        secondary:
          "bg-secondary text-white shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:bg-[#fb8b3c] hover:-translate-y-0.5",
        ghost:
          "text-white/50 hover:text-white hover:bg-white/5 transition-colors",
        link: "text-primary underline-offset-4 hover:underline text-glow",
        tech: 
          "border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] tracking-widest text-[10px] transition-all duration-300",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-md px-3 text-[10px]",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
