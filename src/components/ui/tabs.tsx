'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'inline-flex items-center justify-center gap-1',
  {
    variants: {
      variant: {
        default: 'bg-white/5 p-1 rounded-lg border border-white/10',
        pills: 'gap-2',
        underline: 'border-b border-white/10 gap-0 rounded-none p-0',
      },
      size: {
        default: 'h-10',
        sm: 'h-8',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function TabsList({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: [
          'px-3 py-1.5 rounded-md text-white/60',
          'hover:text-white hover:bg-white/5',
          'data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm',
        ].join(' '),
        pills: [
          'px-4 py-2 rounded-full text-white/60 border border-transparent',
          'hover:text-white hover:bg-white/5',
          'data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500',
        ].join(' '),
        underline: [
          'px-4 py-2.5 text-white/60 border-b-2 border-transparent -mb-px',
          'hover:text-white',
          'data-[state=active]:text-white data-[state=active]:border-purple-500',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        'data-[state=inactive]:hidden',
        'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2',
        'duration-200',
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
