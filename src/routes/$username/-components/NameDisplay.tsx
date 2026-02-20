import { useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { NameEffect } from '@/server/db/schema'
import { getNameStyle, getNameAnimation } from '../-styles'

interface NameDisplayProps {
  name: string
  nameEffect: NameEffect | null
}

export function NameDisplay({ name, nameEffect }: NameDisplayProps) {
  const measureRef = useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = useState<number | null>(null)
  const style = nameEffect?.style ?? 'none'
  const animation = nameEffect?.animation ?? 'none'
  const isTyping = animation === 'typing'
  const isGlitch = style === 'glitch'

  useEffect(() => {
    if (measureRef.current) setTextWidth(measureRef.current.offsetWidth)
  })

  const nameStyle = getNameStyle(nameEffect)
  const animProps = !isTyping ? getNameAnimation(animation) : {}

  return (
    <motion.h1
      key={`${style}-${animation}`}
      className="text-2xl sm:text-4xl font-bold text-white"
      style={isTyping ? {} : nameStyle}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initial={animProps.initial as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate={animProps.animate as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transition={animProps.transition as any}
    >
      {isTyping ? (
        <span className="inline-block relative whitespace-nowrap">
          <span ref={measureRef} className="invisible absolute whitespace-nowrap" aria-hidden>
            {name}
          </span>
          <motion.span
            key={`typing-${style}-${textWidth}`}
            className="inline-block overflow-hidden whitespace-nowrap align-bottom"
            animate={textWidth ? { width: [0, textWidth, textWidth, 0] } : {}}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.55, 0.85, 1] }}
            style={{ ...nameStyle, width: 0 }}
          >
            {name}
          </motion.span>
          <motion.span
            className="inline-block w-[2px] h-[0.8em] bg-current align-middle ml-0.5"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'mirror' }}
          />
        </span>
      ) : isGlitch ? (
        <span className="relative">
          <span className="relative z-10">{name}</span>
          <motion.span
            className="absolute inset-0 text-[#ff0040] z-0"
            animate={{ x: [-1, 1, -1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            {name}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-[#00ff9f] z-0"
            animate={{ x: [1, -1, 1] }}
            transition={{ duration: 0.15, repeat: Infinity, delay: 0.05 }}
          >
            {name}
          </motion.span>
        </span>
      ) : (
        name
      )}
    </motion.h1>
  )
}
