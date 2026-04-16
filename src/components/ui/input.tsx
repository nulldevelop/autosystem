import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-white/20 selection:bg-primary/30 selection:text-white bg-white/[0.03] border-white/10 h-10 w-full min-w-0 rounded-lg border px-4 py-2 text-sm shadow-inner transition-all outline-none disabled:opacity-50",
        "focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.05]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
