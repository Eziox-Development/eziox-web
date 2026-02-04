import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-lg bg-white/10',
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({ className, lines = 1, ...props }: React.ComponentProps<'div'> & { lines?: number }) {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
            className
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ className, size = 'default', ...props }: React.ComponentProps<'div'> & { 
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
      className={cn('rounded-xl border border-white/10 bg-white/5 p-4 space-y-4', className)}
      {...props}
    >
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard }
