import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Timer } from 'lucide-react'

interface CountdownWidgetProps {
  config: {
    targetDate?: string
    title?: string
    showDays?: boolean
    showHours?: boolean
    showMinutes?: boolean
    showSeconds?: boolean
  }
  title?: string | null
}

export function CountdownWidget({ config, title }: CountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!config.targetDate) return

    const calculateTimeLeft = () => {
      const target = new Date(config.targetDate!).getTime()
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        setIsExpired(true)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [config.targetDate])

  const showDays = config.showDays !== false
  const showHours = config.showHours !== false
  const showMinutes = config.showMinutes !== false
  const showSeconds = config.showSeconds !== false

  if (!config.targetDate) {
    return (
      <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center">
        <Timer size={32} className="mx-auto mb-2 text-white/40" />
        <p className="text-white/60 text-sm">No target date set</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 border border-white/10"
    >
      {(title || config.title) && (
        <h3 className="text-lg font-bold text-white text-center mb-4">
          {title || config.title}
        </h3>
      )}

      {isExpired ? (
        <p className="text-2xl font-bold text-center text-primary">
          🎉 Event Started!
        </p>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {showDays && (
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {timeLeft.days}
              </div>
              <div className="text-xs text-white/60 uppercase">Days</div>
            </div>
          )}
          {showDays && showHours && (
            <span className="text-2xl text-white/40">:</span>
          )}
          {showHours && (
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/60 uppercase">Hours</div>
            </div>
          )}
          {showHours && showMinutes && (
            <span className="text-2xl text-white/40">:</span>
          )}
          {showMinutes && (
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/60 uppercase">Min</div>
            </div>
          )}
          {showMinutes && showSeconds && (
            <span className="text-2xl text-white/40">:</span>
          )}
          {showSeconds && (
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/60 uppercase">Sec</div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
