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

export type ImageCategory = 'car' | 'tree' | 'house' | 'cat' | 'dog' | 'flower' | 'mountain' | 'ocean' | 'bird' | 'food'

export type ChallengeImage = {
  id: string
  category: ImageCategory
  emoji: string
}

export type ChallengeData = {
  targetCategory: ImageCategory
  targetLabel: string
  images: ChallengeImage[]
  correctIds: string[]
}

const CATEGORY_EMOJIS: Record<ImageCategory, string[]> = {
  car: ['🚗', '🚙', '🏎️', '🚕', '🚐'],
  tree: ['🌲', '🌳', '🌴', '🎄', '🌿'],
  house: ['🏠', '🏡', '🏘️', '🏚️', '🛖'],
  cat: ['🐱', '😺', '😸', '🐈', '😻'],
  dog: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩'],
  flower: ['🌸', '🌺', '🌻', '🌹', '💐'],
  mountain: ['⛰️', '🏔️', '🗻', '🌋', '🏞️'],
  ocean: ['🌊', '🏖️', '🐚', '🦀', '🐠'],
  bird: ['🐦', '🦅', '🦆', '🦉', '🐧'],
  food: ['🍕', '🍔', '🍟', '🌮', '🍣'],
}

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  car: 'cars',
  tree: 'trees',
  house: 'houses',
  cat: 'cats',
  dog: 'dogs',
  flower: 'flowers',
  mountain: 'mountains',
  ocean: 'ocean/beach',
  bird: 'birds',
  food: 'food',
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp!
  }
  return shuffled
}

function getRandomEmoji(category: ImageCategory): string {
  const emojis = CATEGORY_EMOJIS[category]
  return emojis[Math.floor(Math.random() * emojis.length)]!
}

export function generateChallenge(): ChallengeData {
  const categories = Object.keys(CATEGORY_EMOJIS) as ImageCategory[]
  const targetCategory = categories[Math.floor(Math.random() * categories.length)]!
  
  const correctCount = 2 + Math.floor(Math.random() * 2)
  const totalImages = 9
  const incorrectCount = totalImages - correctCount
  
  const images: ChallengeImage[] = []
  const correctIds: string[] = []
  
  for (let i = 0; i < correctCount; i++) {
    const id = `correct-${i}-${Date.now()}`
    correctIds.push(id)
    images.push({
      id,
      category: targetCategory,
      emoji: getRandomEmoji(targetCategory),
    })
  }
  
  const otherCategories = categories.filter(c => c !== targetCategory)
  for (let i = 0; i < incorrectCount; i++) {
    const randomCat = otherCategories[Math.floor(Math.random() * otherCategories.length)]!
    images.push({
      id: `incorrect-${i}-${Date.now()}`,
      category: randomCat,
      emoji: getRandomEmoji(randomCat),
    })
  }
  
  return {
    targetCategory,
    targetLabel: CATEGORY_LABELS[targetCategory],
    images: shuffleArray(images),
    correctIds,
  }
}

export function validateImageChallenge(selectedIds: string[], correctIds: string[]): boolean {
  if (selectedIds.length !== correctIds.length) return false
  const sortedSelected = [...selectedIds].sort()
  const sortedCorrect = [...correctIds].sort()
  return sortedSelected.every((id, i) => id === sortedCorrect[i])
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
