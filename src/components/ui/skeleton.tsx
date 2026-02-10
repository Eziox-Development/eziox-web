import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative isolate overflow-hidden rounded-lg bg-border/30',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-border/40 before:to-transparent',
        'before:animate-[shimmer_2s_ease-in-out_infinite]',
        className,
      )}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.ComponentProps<'div'> & { lines?: number }) {
  return (
    <div className="space-y-2.5" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full',
            className,
          )}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  size?: 'sm' | 'default' | 'lg' | 'xl'
}) {
  const sizeClasses = {
    sm: 'size-8',
    default: 'size-10',
    lg: 'size-12',
    xl: 'size-16',
  }

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/40 bg-card/50 p-4 space-y-4 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard }
