import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm [a&]:hover:bg-primary/90 [a&]:hover:shadow-md',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-white shadow-sm [a&]:hover:bg-destructive/90 dark:bg-destructive/80',
        outline:
          'border-white/20 bg-transparent text-foreground [a&]:hover:bg-white/5 [a&]:hover:border-white/30',
        success:
          'border-transparent bg-emerald-500/20 text-emerald-400 [a&]:hover:bg-emerald-500/30',
        warning:
          'border-transparent bg-amber-500/20 text-amber-400 [a&]:hover:bg-amber-500/30',
        info:
          'border-transparent bg-blue-500/20 text-blue-400 [a&]:hover:bg-blue-500/30',
        purple:
          'border-transparent bg-purple-500/20 text-purple-400 [a&]:hover:bg-purple-500/30',
        ghost:
          'border-transparent bg-white/5 text-white/70 [a&]:hover:bg-white/10 [a&]:hover:text-white',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-px text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
