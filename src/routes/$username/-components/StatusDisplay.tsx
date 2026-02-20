import { useState, useEffect } from 'react'
import type { StatusText } from '@/server/db/schema'

interface StatusDisplayProps {
  statusText: StatusText | null
}

export function StatusDisplay({ statusText }: StatusDisplayProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!statusText?.enabled || !statusText.typewriter || !statusText.text) return
    setDisplayed('')
    setDone(false)
    const speed = statusText.typewriterSpeed ?? 60
    let i = 0
    const interval = setInterval(() => {
      if (i < statusText.text.length) {
        setDisplayed(statusText.text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [statusText?.enabled, statusText?.typewriter, statusText?.text, statusText?.typewriterSpeed])

  if (!statusText?.enabled || !statusText.text) return null

  const renderText = (text: string) => {
    if (!statusText.coloredWords?.length) return text
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0
    while (remaining.length > 0) {
      let earliest = -1
      let earliestWord: { word: string; color: string } | null = null
      for (const cw of statusText.coloredWords) {
        const idx = remaining.toLowerCase().indexOf(cw.word.toLowerCase())
        if (idx !== -1 && (earliest === -1 || idx < earliest)) {
          earliest = idx
          earliestWord = cw
        }
      }
      if (earliest === -1 || !earliestWord) {
        parts.push(remaining)
        break
      }
      if (earliest > 0) parts.push(remaining.slice(0, earliest))
      parts.push(
        <span key={key++} style={{ color: earliestWord.color, fontWeight: 700 }}>
          {remaining.slice(earliest, earliest + earliestWord.word.length)}
        </span>,
      )
      remaining = remaining.slice(earliest + earliestWord.word.length)
    }
    return parts
  }

  const displayText = statusText.typewriter ? displayed : statusText.text

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {statusText.emoji && (
        <span className="text-lg">{statusText.emoji}</span>
      )}
      <span className="text-sm text-white/60 font-medium">
        {renderText(displayText)}
        {statusText.typewriter && !done && (
          <span
            className="inline-block w-0.5 h-4 bg-white/60 ml-0.5 align-middle"
            style={{ animation: 'typewriter-blink 0.8s step-end infinite' }}
          />
        )}
      </span>
    </div>
  )
}
