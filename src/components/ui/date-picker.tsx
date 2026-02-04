'use client'

import * as React from 'react'
import { format, isValid, parse } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'de' ? de : enUS

  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    () => {
      if (value) {
        const parsed = parse(value, 'yyyy-MM-dd', new Date())
        return isValid(parsed) ? parsed : undefined
      }
      return undefined
    },
  )

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(parsed)) {
        setSelectedDate(parsed)
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && onChange) {
      onChange(format(date, 'yyyy-MM-dd'))
    } else if (!date && onChange) {
      onChange('')
    }
    setOpen(false)
  }

  const displayValue = React.useMemo(() => {
    if (selectedDate && isValid(selectedDate)) {
      return format(selectedDate, 'PPP', { locale })
    }
    return null
  }, [selectedDate, locale])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-12 bg-background-secondary border-border hover:bg-background-secondary/80',
            !displayValue && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {displayValue || (
            <span className="text-foreground-muted">
              {placeholder || t('common.selectDate', 'Select date')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={locale}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
          className="rounded-lg"
        />
        <div className="flex items-center justify-between p-3 border-t border-border bg-background-secondary/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDate(undefined)
              onChange?.('')
              setOpen(false)
            }}
            className="text-foreground-muted hover:text-foreground"
          >
            {t('common.clear', 'Clear')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date()
              setSelectedDate(today)
              onChange?.(format(today, 'yyyy-MM-dd'))
              setOpen(false)
            }}
            className="text-primary hover:text-primary"
          >
            {t('common.today', 'Today')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
