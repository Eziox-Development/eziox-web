export type BotCheckResult = {
  passed: boolean
  score: number
  checks: {
    honeypot: boolean
    timing: boolean
    challenge: boolean
    interaction: boolean
  }
}

export type ChallengeData = {
  question: string
  answer: number
  options: number[]
}

export function generateChallenge(): ChallengeData {
  const operations = [
    () => {
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      return { question: `${a} + ${b}`, answer: a + b }
    },
    () => {
      const a = Math.floor(Math.random() * 10) + 5
      const b = Math.floor(Math.random() * 5) + 1
      return { question: `${a} - ${b}`, answer: a - b }
    },
    () => {
      const a = Math.floor(Math.random() * 5) + 2
      const b = Math.floor(Math.random() * 5) + 2
      return { question: `${a} × ${b}`, answer: a * b }
    },
  ]

  const opIndex = Math.floor(Math.random() * operations.length)
  const selectedOp = operations[opIndex]
  if (!selectedOp) {
    return { question: '2 + 2', answer: 4, options: [3, 4, 5, 6] }
  }
  const { question, answer } = selectedOp()

  const options = new Set<number>([answer])
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5
    if (offset !== 0) options.add(answer + offset)
  }

  return {
    question,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  }
}

export function validateBotCheck(data: {
  honeypotValue: string
  startTime: number
  challengeAnswer: number | null
  correctAnswer: number
  interactionCount: number
  mouseMovements: number
}): BotCheckResult {
  const checks = {
    honeypot: data.honeypotValue === '',
    timing: Date.now() - data.startTime >= 2000,
    challenge: data.challengeAnswer === data.correctAnswer,
    interaction: data.interactionCount >= 3 || data.mouseMovements >= 5,
  }

  const score = Object.values(checks).filter(Boolean).length
  const passed = checks.honeypot && checks.timing && checks.challenge

  return { passed, score, checks }
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua)
  
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (typeof window === 'undefined') return 'lg'
  
  const width = window.innerWidth
  if (width < 640) return 'xs'
  if (width < 768) return 'sm'
  if (width < 1024) return 'md'
  if (width < 1280) return 'lg'
  if (width < 1536) return 'xl'
  return '2xl'
}
