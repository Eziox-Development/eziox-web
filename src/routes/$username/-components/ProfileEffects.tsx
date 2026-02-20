import type { ProfileEffects as ProfileEffectsType } from '@/server/db/schema'

interface ProfileEffectsProps {
  effects: ProfileEffectsType
}

export function ProfileEffectsOverlay({ effects }: ProfileEffectsProps) {
  if (!effects.enabled || effects.effect === 'none') return null

  const count = effects.intensity === 'intense' ? 'high' : effects.intensity === 'subtle' ? 'low' : 'mid'
  const color = effects.color || '#fbbf24'

  const counts: Record<string, Record<string, number>> = {
    sparkles:  { low: 12, mid: 24, high: 40 },
    snow:      { low: 15, mid: 30, high: 60 },
    rain:      { low: 20, mid: 40, high: 80 },
    confetti:  { low: 15, mid: 30, high: 50 },
    fireflies: { low: 8,  mid: 15, high: 25 },
    bubbles:   { low: 8,  mid: 16, high: 30 },
    stars:     { low: 10, mid: 20, high: 35 },
    matrix:    { low: 15, mid: 30, high: 60 },
  }

  const n = counts[effects.effect]?.[count] ?? 20

  return (
    <div className="fixed inset-0 z-2 pointer-events-none overflow-hidden">
      {effects.effect === 'sparkles' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{
          left: `${Math.random() * 100}%`,
          bottom: `${Math.random() * -20}%`,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: `sparkle-float ${3 + Math.random() * 4}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
      {effects.effect === 'snow' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${Math.random() * 100}%`,
          top: '-5%',
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          background: color === '#fbbf24' ? '#ffffff' : color,
          opacity: 0.6 + Math.random() * 0.4,
          animation: `snow-fall ${5 + Math.random() * 8}s linear infinite`,
          animationDelay: `${Math.random() * 8}s`,
        }} />
      ))}
      {effects.effect === 'rain' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute" style={{
          left: `${Math.random() * 100}%`,
          top: '-5%',
          width: '1px',
          height: `${10 + Math.random() * 15}px`,
          background: `linear-gradient(transparent, ${color === '#fbbf24' ? '#60a5fa' : color})`,
          animation: `rain-fall ${0.5 + Math.random() * 0.8}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
      {effects.effect === 'fireflies' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
          animation: `firefly-float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
      {effects.effect === 'bubbles' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute rounded-full border" style={{
          left: `${Math.random() * 100}%`,
          bottom: '-5%',
          width: `${8 + Math.random() * 20}px`,
          height: `${8 + Math.random() * 20}px`,
          borderColor: `${color === '#fbbf24' ? '#60a5fa' : color}40`,
          background: `${color === '#fbbf24' ? '#60a5fa' : color}10`,
          animation: `bubble-rise ${4 + Math.random() * 6}s ease-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
      {effects.effect === 'confetti' && Array.from({ length: n }).map((_, i) => {
        const confettiColors = [color, '#ec4899', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316']
        const c = confettiColors[i % confettiColors.length]
        return (
          <div key={i} className="absolute" style={{
            left: `${Math.random() * 100}%`,
            top: '-3%',
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            background: c,
            borderRadius: i % 3 === 0 ? '50%' : '1px',
            animation: `sparkle-float ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }} />
        )
      })}
      {effects.effect === 'stars' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${6 + Math.random() * 8}px`,
          color,
          textShadow: `0 0 6px ${color}, 0 0 12px ${color}40`,
          animation: `firefly-float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: 0.4 + Math.random() * 0.6,
        }}>★</div>
      ))}
      {effects.effect === 'matrix' && Array.from({ length: n }).map((_, i) => (
        <div key={i} className="absolute font-mono" style={{
          left: `${Math.random() * 100}%`,
          top: '-5%',
          fontSize: `${8 + Math.random() * 6}px`,
          color: '#22c55e',
          textShadow: '0 0 8px #22c55e60',
          animation: `rain-fall ${1 + Math.random() * 2}s linear infinite`,
          animationDelay: `${Math.random() * 3}s`,
          opacity: 0.5 + Math.random() * 0.5,
        }}>{String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))}</div>
      ))}
    </div>
  )
}
