import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-300 ease-out overflow-hidden select-none backdrop-blur-sm',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(var(--primary-rgb),0.3)] [a&]:hover:shadow-[0_4px_16px_rgba(var(--primary-rgb),0.4)] [a&]:hover:brightness-110',
        secondary:
          'border-border/50 bg-secondary/80 text-secondary-foreground [a&]:hover:bg-secondary [a&]:hover:border-border/70',
        destructive:
          'border-transparent bg-destructive/90 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)] [a&]:hover:shadow-[0_4px_16px_rgba(239,68,68,0.4)] [a&]:hover:brightness-110',
        outline:
          'border-border/60 bg-card/30 text-foreground backdrop-blur-md [a&]:hover:bg-card/50 [a&]:hover:border-border/80',
        success:
          'border-emerald-500/20 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.1)] [a&]:hover:bg-emerald-500/25 [a&]:hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
        warning:
          'border-amber-500/20 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)] [a&]:hover:bg-amber-500/25 [a&]:hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        info:
          'border-blue-500/20 bg-blue-500/15 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)] [a&]:hover:bg-blue-500/25 [a&]:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        purple:
          'border-purple-500/20 bg-purple-500/15 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.1)] [a&]:hover:bg-purple-500/25 [a&]:hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        ghost:
          'border-transparent bg-muted/30 text-foreground-muted [a&]:hover:bg-muted/50 [a&]:hover:text-foreground',
        gradient:
          'border-transparent bg-gradient-to-r from-primary to-accent text-white shadow-[0_2px_12px_rgba(var(--primary-rgb),0.3)] [a&]:hover:shadow-[0_4px_20px_rgba(var(--primary-rgb),0.4)] [a&]:hover:brightness-110',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-px text-[10px]',
        lg: 'px-3.5 py-1 text-sm',
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
