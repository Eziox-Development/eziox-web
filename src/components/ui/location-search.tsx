'use client'

import * as React from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

// Major cities worldwide - can be extended or replaced with API
const CITIES = [
  // Europe
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.582 },
  { name: 'Hamburg', country: 'Germany', lat: 53.5511, lon: 9.9937 },
  { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821 },
  { name: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.19 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },

  // North America
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', country: 'USA', lat: 33.4484, lon: -112.074 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321 },
  { name: 'Miami', country: 'USA', lat: 25.7617, lon: -80.1918 },
  { name: 'Boston', country: 'USA', lat: 42.3601, lon: -71.0589 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },

  // Asia
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818 },

  // South America
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.711, lon: -74.0721 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },

  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8509, lon: 174.7645 },

  // Africa
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
]

interface LocationSearchProps {
  value?: string
  onChange?: (location: string, coords?: { lat: number; lon: number }) => void
  placeholder?: string
  className?: string
}

export function LocationSearch({
  value,
  onChange,
  placeholder,
  className,
}: LocationSearchProps) {
  const { t } = useTranslation()
  const [search, setSearch] = React.useState(value || '')
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const filteredCities = React.useMemo(() => {
    if (!search.trim()) return CITIES.slice(0, 10)
    const searchLower = search.toLowerCase()
    return CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower),
    ).slice(0, 10)
  }, [search])

  const handleSelect = (city: (typeof CITIES)[0]) => {
    const locationStr = `${city.name}, ${city.country}`
    setSearch(locationStr)
    onChange?.(locationStr, { lat: city.lat, lon: city.lon })
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1,
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCities[highlightedIndex]) {
          handleSelect(filteredCities[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  React.useEffect(() => {
    setHighlightedIndex(0)
  }, [search])

  React.useEffect(() => {
    if (value !== undefined && value !== search) {
      setSearch(value)
    }
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            t('dashboard.widgets.config.searchLocation', 'Search for a city...')
          }
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-background-secondary border border-border text-foreground text-sm placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              onChange?.('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-background-secondary/80 text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 py-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredCities.map((city, index) => (
            <button
              key={`${city.name}-${city.country}`}
              type="button"
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'w-full px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors',
                index === highlightedIndex
                  ? 'bg-primary/10 text-foreground'
                  : 'text-foreground-muted hover:bg-background-secondary',
              )}
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium">{city.name}</span>
              <span className="text-foreground-muted/70">{city.country}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && search && filteredCities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 p-4 bg-card border border-border rounded-lg shadow-lg text-center text-sm text-foreground-muted">
          {t('dashboard.widgets.config.noLocationsFound', 'No locations found')}
        </div>
      )}
    </div>
  )
}
