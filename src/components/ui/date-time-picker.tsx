'use client'

import * as React from 'react'
import { format, isValid } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  className,
}: DateTimePickerProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'de' ? de : enUS
  
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => {
    if (value) {
      const parsed = new Date(value)
      return isValid(parsed) ? parsed : undefined
    }
    return undefined
  })
  const [hours, setHours] = React.useState(() => {
    if (value) {
      const parsed = new Date(value)
      return isValid(parsed) ? parsed.getHours() : 12
    }
    return 12
  })
  const [minutes, setMinutes] = React.useState(() => {
    if (value) {
      const parsed = new Date(value)
      return isValid(parsed) ? parsed.getMinutes() : 0
    }
    return 0
  })

  const updateValue = React.useCallback((date: Date | undefined, h: number, m: number) => {
    if (date && onChange) {
      const newDate = new Date(date)
      newDate.setHours(h, m, 0, 0)
      onChange(newDate.toISOString())
    }
  }, [onChange])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    updateValue(date, hours, minutes)
  }

  const handleHoursChange = (newHours: number) => {
    const h = Math.max(0, Math.min(23, newHours))
    setHours(h)
    updateValue(selectedDate, h, minutes)
  }

  const handleMinutesChange = (newMinutes: number) => {
    const m = Math.max(0, Math.min(59, newMinutes))
    setMinutes(m)
    updateValue(selectedDate, hours, m)
  }

  const displayValue = React.useMemo(() => {
    if (selectedDate && isValid(selectedDate)) {
      const dateStr = format(selectedDate, 'PPP', { locale })
      return `${dateStr} · ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
    return null
  }, [selectedDate, hours, minutes, locale])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal bg-background-secondary border-border hover:bg-background-secondary/80',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {displayValue || <span className="text-foreground-muted">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
        <div className="flex flex-col sm:flex-row">
          {/* Calendar */}
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-border">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={locale}
              initialFocus
              className="rounded-lg"
            />
          </div>
          
          {/* Time Picker */}
          <div className="p-4 flex flex-col items-center justify-center min-w-[140px]">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t('common.time', 'Time')}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleHoursChange(hours + 1)}
                  className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-foreground-muted hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={String(hours).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) handleHoursChange(val)
                  }}
                  className="w-12 h-12 text-center text-xl font-semibold bg-background-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleHoursChange(hours - 1)}
                  className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-foreground-muted hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <span className="text-2xl font-bold text-foreground-muted px-1">:</span>
              
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleMinutesChange(minutes + 5)}
                  className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-foreground-muted hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={String(minutes).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) handleMinutesChange(val)
                  }}
                  className="w-12 h-12 text-center text-xl font-semibold bg-background-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleMinutesChange(minutes - 5)}
                  className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-foreground-muted hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Quick time presets */}
            <div className="flex gap-1 mt-4">
              {[
                { h: 0, m: 0, label: '00:00' },
                { h: 12, m: 0, label: '12:00' },
                { h: 18, m: 0, label: '18:00' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setHours(preset.h)
                    setMinutes(preset.m)
                    updateValue(selectedDate, preset.h, preset.m)
                  }}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-all',
                    hours === preset.h && minutes === preset.m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background-secondary text-foreground-muted hover:text-foreground hover:bg-background-secondary/80'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border bg-background-secondary/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDate(undefined)
              setHours(12)
              setMinutes(0)
              onChange?.('')
            }}
            className="text-foreground-muted hover:text-foreground"
          >
            {t('common.clear', 'Clear')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const now = new Date()
              setSelectedDate(now)
              setHours(now.getHours())
              setMinutes(now.getMinutes())
              updateValue(now, now.getHours(), now.getMinutes())
            }}
            className="text-primary hover:text-primary"
          >
            {t('common.now', 'Now')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
