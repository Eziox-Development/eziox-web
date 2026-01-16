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

export type ChallengeType = 'rotate' | 'slider' | 'pattern' | 'sequence'

export type RotateChallenge = {
  type: 'rotate'
  targetAngle: number
  tolerance: number
}

export type SliderChallenge = {
  type: 'slider'
  targetPosition: number
  tolerance: number
}

export type PatternChallenge = {
  type: 'pattern'
  pattern: number[]
  gridSize: number
}

export type SequenceChallenge = {
  type: 'sequence'
  sequence: number[]
  displayTime: number
}

export type ChallengeData = RotateChallenge | SliderChallenge | PatternChallenge | SequenceChallenge

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateChallenge(): ChallengeData {
  const types: ChallengeType[] = ['rotate', 'slider', 'pattern']
  const type = types[Math.floor(Math.random() * types.length)]!

  switch (type) {
    case 'rotate':
      return {
        type: 'rotate',
        targetAngle: getRandomInt(1, 8) * 45,
        tolerance: 20,
      }
    case 'slider':
      return {
        type: 'slider',
        targetPosition: getRandomInt(20, 80),
        tolerance: 8,
      }
    case 'pattern':
      const gridSize = 3
      const patternLength = getRandomInt(3, 5)
      const pattern: number[] = []
      const available = Array.from({ length: gridSize * gridSize }, (_, i) => i)
      for (let i = 0; i < patternLength; i++) {
        const idx = Math.floor(Math.random() * available.length)
        pattern.push(available[idx]!)
        available.splice(idx, 1)
      }
      return {
        type: 'pattern',
        pattern,
        gridSize,
      }
    default:
      return {
        type: 'slider',
        targetPosition: 50,
        tolerance: 8,
      }
  }
}

export function validateRotateChallenge(userAngle: number, challenge: RotateChallenge): boolean {
  const normalizedUser = ((userAngle % 360) + 360) % 360
  const normalizedTarget = ((challenge.targetAngle % 360) + 360) % 360
  const diff = Math.abs(normalizedUser - normalizedTarget)
  return diff <= challenge.tolerance || diff >= 360 - challenge.tolerance
}

export function validateSliderChallenge(userPosition: number, challenge: SliderChallenge): boolean {
  return Math.abs(userPosition - challenge.targetPosition) <= challenge.tolerance
}

export function validatePatternChallenge(userPattern: number[], challenge: PatternChallenge): boolean {
  if (userPattern.length !== challenge.pattern.length) return false
  return userPattern.every((val, idx) => val === challenge.pattern[idx])
}

export function validateChallenge(challenge: ChallengeData, userInput: number | number[]): boolean {
  switch (challenge.type) {
    case 'rotate':
      return validateRotateChallenge(userInput as number, challenge)
    case 'slider':
      return validateSliderChallenge(userInput as number, challenge)
    case 'pattern':
      return validatePatternChallenge(userInput as number[], challenge)
    default:
      return false
  }
}

export function validateBotCheck(data: {
  honeypotValue: string
  startTime: number
  challengePassed: boolean
  interactionCount: number
  mouseMovements: number
}): BotCheckResult {
  const checks = {
    honeypot: data.honeypotValue === '',
    timing: Date.now() - data.startTime >= 1500,
    challenge: data.challengePassed,
    interaction: data.interactionCount >= 2 || data.mouseMovements >= 3,
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
