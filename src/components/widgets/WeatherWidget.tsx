import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CloudSun, MapPin, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2 } from 'lucide-react'

interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
}

interface WeatherWidgetProps {
  config: {
    location?: string
    lat?: number
    lon?: number
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    units?: 'celsius' | 'fahrenheit'
    showForecast?: boolean
  }
  title?: string | null
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return Sun
  if (code >= 1 && code <= 3) return CloudSun
  if (code >= 45 && code <= 48) return Cloud
  if (code >= 51 && code <= 67) return CloudRain
  if (code >= 71 && code <= 77) return CloudSnow
  if (code >= 80 && code <= 82) return CloudRain
  if (code >= 85 && code <= 86) return CloudSnow
  if (code >= 95 && code <= 99) return CloudLightning
  return CloudSun
}

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear'
  if (code >= 1 && code <= 3) return 'Partly cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 56 && code <= 57) return 'Freezing drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 66 && code <= 67) return 'Freezing rain'
  if (code >= 71 && code <= 75) return 'Snow'
  if (code === 77) return 'Snow grains'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export function WeatherWidget({ config, title }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config.lat || !config.lon) {
      setLoading(false)
      return
    }

    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tempUnit = config.units === 'fahrenheit' ? 'fahrenheit' : 'celsius'
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=${tempUnit}`
        )
        
        if (!response.ok) throw new Error('Failed to fetch weather')
        
        const data = await response.json()
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          windSpeed: Math.round(data.current.wind_speed_10m),
        })
      } catch {
        setError('Could not load weather')
      } finally {
        setLoading(false)
      }
    }

    void fetchWeather()
    const interval = setInterval(() => void fetchWeather(), 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [config.lat, config.lon, config.units])

  if (!config.location) {
    return (
      <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center">
        <CloudSun size={24} className="mx-auto mb-1 text-white/40" />
        <p className="text-white/60 text-xs">No location configured</p>
      </div>
    )
  }

  const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode) : CloudSun

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 min-w-[140px]"
    >
      {title && (
        <h3 className="text-sm font-bold text-white text-center mb-2">{title}</h3>
      )}
      <div className="flex items-center gap-1 text-white/60 mb-2">
        <MapPin size={12} />
        <span className="text-xs truncate">{config.location}</span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 size={24} className="animate-spin text-white/40" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 text-center">{error}</p>
      ) : weather ? (
        <div className="text-center">
          <WeatherIcon size={36} className="mx-auto mb-1 text-amber-400" />
          <p className="text-2xl font-bold text-white">
            {weather.temperature}°{config.units === 'fahrenheit' ? 'F' : 'C'}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {getWeatherDescription(weather.weatherCode)}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1 text-white/40">
            <Wind size={10} />
            <span className="text-xs">{weather.windSpeed} km/h</span>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <CloudSun size={36} className="mx-auto mb-1 text-white/40" />
          <p className="text-xs text-white/60">No coordinates</p>
        </div>
      )}
    </motion.div>
  )
}
