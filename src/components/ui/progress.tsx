import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'gradient'

const variantStyles: Record<ProgressVariant, { bar: string; glow: string }> = {
  default: {
    bar: 'bg-primary',
    glow: 'shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]',
  },
  success: {
    bar: 'bg-emerald-500',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.4)]',
  },
  warning: {
    bar: 'bg-amber-500',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  danger: {
    bar: 'bg-red-500',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
  },
  gradient: {
    bar: 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]',
    glow: 'shadow-[0_0_16px_rgba(var(--primary-rgb),0.35)]',
  },
}

function Progress({
  className,
  value,
  variant = 'default',
  indeterminate = false,
  glow = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: ProgressVariant
  indeterminate?: boolean
  glow?: boolean
}) {
  const styles = variantStyles[variant]

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-border/30',
        glow && 'ring-1 ring-border/20',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all duration-500 ease-out',
          styles.bar,
          glow && styles.glow,
          indeterminate && 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]',
          variant === 'gradient' && !indeterminate && 'animate-[progress-shimmer_2s_linear_infinite]',
        )}
        style={
          indeterminate
            ? { width: '40%', transform: 'translateX(0%)' }
            : { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
