import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-xl border bg-background-secondary/50 px-3.5 py-2 text-sm text-foreground',
        'border-border backdrop-blur-sm',
        'placeholder:text-muted-foreground/60',
        'selection:bg-primary selection:text-primary-foreground',
        'transition-all duration-300 ease-out outline-none',
        'hover:border-border/80 hover:bg-background-secondary/70',
        'focus-visible:border-primary/50 focus-visible:bg-background-secondary/60 focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]',
        'aria-invalid:border-destructive/50 aria-invalid:ring-destructive/15 aria-invalid:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
