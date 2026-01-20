import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

export { ANIMATED_PRESETS, type AnimatedPresetId } from './animated-presets'

export interface AnimatedBackgroundProps {
  preset: string
  speed?: 'slow' | 'normal' | 'fast'
  intensity?: 'subtle' | 'normal' | 'intense'
  colors?: string[]
  contained?: boolean // If true, uses absolute positioning instead of fixed
}

const SPEED_MAP = {
  slow: 2,
  normal: 1,
  fast: 0.5,
}

const INTENSITY_MAP = {
  subtle: 0.3,
  normal: 0.6,
  intense: 1,
}

export function AnimatedBackground({ preset, speed = 'normal', intensity = 'normal', colors, contained = false }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speedMultiplier = SPEED_MAP[speed]
  const intensityValue = INTENSITY_MAP[intensity]
  const primaryColor = colors?.[0] || '#8b5cf6'
  const secondaryColor = colors?.[1] || '#ec4899'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; char?: string }> = []

    const resize = () => {
      if (contained && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const initParticles = (count: number) => {
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * intensityValue,
        })
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${primaryColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        p.x += p.vx / speedMultiplier
        p.y += p.vy / speedMultiplier

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })
    }

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
      ctx.font = '14px monospace'
      
      particles.forEach((p) => {
        const char = chars.charAt(Math.floor(Math.random() * chars.length))
        ctx.fillStyle = `${primaryColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fillText(char, p.x, p.y)
        
        p.y += 15 / speedMultiplier
        if (p.y > canvas.height) {
          p.y = 0
          p.x = Math.random() * canvas.width
        }
      })
    }

    const drawSakura = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.vx * Date.now() * 0.001)
        
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * Math.PI / 180
          const x = Math.cos(angle) * p.size
          const y = Math.sin(angle) * p.size
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = `rgba(255, 182, 193, ${p.opacity})`
        ctx.fill()
        ctx.restore()

        p.x += Math.sin(p.y * 0.01) * 0.5 / speedMultiplier
        p.y += (1 + p.size * 0.1) / speedMultiplier
        
        if (p.y > canvas.height) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
      })
    }

    const drawStarfield = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        const twinkle = Math.sin(Date.now() * 0.005 + p.x) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * twinkle})`
        ctx.fill()
      })

      if (Math.random() < 0.01 * intensityValue) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: 0,
          length: 50 + Math.random() * 100,
        }
        ctx.beginPath()
        ctx.moveTo(shootingStar.x, shootingStar.y)
        ctx.lineTo(shootingStar.x + shootingStar.length, shootingStar.y + shootingStar.length)
        const gradient = ctx.createLinearGradient(
          shootingStar.x, shootingStar.y,
          shootingStar.x + shootingStar.length, shootingStar.y + shootingStar.length
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const drawAurora = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.0005 / speedMultiplier
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height * 0.3 + i * 30)
        
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = canvas.height * 0.3 + 
            Math.sin(x * 0.005 + time + i) * 50 * intensityValue +
            Math.sin(x * 0.01 + time * 1.5) * 30 * intensityValue +
            i * 30
          ctx.lineTo(x, y)
        }
        
        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        gradient.addColorStop(0, `${primaryColor}${Math.floor(0.1 * intensityValue * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(0.5, `${secondaryColor}${Math.floor(0.2 * intensityValue * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${primaryColor}${Math.floor(0.1 * intensityValue * 255).toString(16).padStart(2, '0')}`)
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    const drawFireflies = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        const glow = Math.sin(Date.now() * 0.003 + p.x + p.y) * 0.5 + 0.5
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 10)
        gradient.addColorStop(0, `rgba(255, 255, 150, ${glow * p.opacity})`)
        gradient.addColorStop(0.5, `rgba(255, 200, 100, ${glow * p.opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 10, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        p.x += Math.sin(Date.now() * 0.001 + p.y) * 0.5 / speedMultiplier
        p.y += Math.cos(Date.now() * 0.001 + p.x) * 0.3 / speedMultiplier
        
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })
    }

    const drawRGBWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.001 / speedMultiplier
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height / 2 + 
            Math.sin(x * 0.01 + time + i * 2) * 100 * intensityValue +
            Math.sin(x * 0.02 + time * 1.5 + i) * 50 * intensityValue
          ctx.lineTo(x, y)
        }
        
        ctx.strokeStyle = i === 0 ? '#ff0000' : i === 1 ? '#00ff00' : '#0000ff'
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.5 * intensityValue
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const drawCyberGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.001 / speedMultiplier
      const gridSize = 50
      const perspective = 0.8
      
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3 * intensityValue
      
      for (let y = 0; y < 20; y++) {
        const yPos = canvas.height * 0.5 + y * gridSize * perspective
        const scale = 1 + y * 0.1
        
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2 - canvas.width * scale / 2, yPos)
        ctx.lineTo(canvas.width / 2 + canvas.width * scale / 2, yPos)
        ctx.stroke()
      }
      
      for (let x = -10; x <= 10; x++) {
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2 + x * gridSize, canvas.height * 0.5)
        ctx.lineTo(canvas.width / 2 + x * gridSize * 3, canvas.height)
        ctx.stroke()
      }
      
      const scanLine = (time % 5) / 5 * canvas.height * 0.5 + canvas.height * 0.5
      ctx.beginPath()
      ctx.moveTo(0, scanLine)
      ctx.lineTo(canvas.width, scanLine)
      ctx.strokeStyle = secondaryColor
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.8 * intensityValue
      ctx.stroke()
      
      ctx.globalAlpha = 1
    }

    const drawSnow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()

        p.x += Math.sin(p.y * 0.01) * 0.5 / speedMultiplier
        p.y += (0.5 + p.size * 0.2) / speedMultiplier
        
        if (p.y > canvas.height) {
          p.y = -5
          p.x = Math.random() * canvas.width
        }
      })
    }

    const drawBokeh = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 20)
        gradient.addColorStop(0, `${primaryColor}${Math.floor(p.opacity * 0.3 * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(0.7, `${secondaryColor}${Math.floor(p.opacity * 0.1 * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 20, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        p.y -= 0.2 / speedMultiplier
        p.x += Math.sin(Date.now() * 0.001 + p.y) * 0.3 / speedMultiplier
        
        if (p.y < -p.size * 20) {
          p.y = canvas.height + p.size * 20
          p.x = Math.random() * canvas.width
        }
      })
    }

    // Rain animation
    const drawRain = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + p.vx * 2, p.y + 20 + p.size * 5)
        ctx.strokeStyle = `rgba(150, 200, 255, ${p.opacity * 0.6})`
        ctx.lineWidth = 1
        ctx.stroke()

        p.x += p.vx / speedMultiplier
        p.y += (15 + p.size * 3) / speedMultiplier
        
        if (p.y > canvas.height) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }
      })
    }

    // Clouds animation
    const drawClouds = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, i) => {
        const cloudY = p.y + Math.sin(Date.now() * 0.0005 + i) * 10
        
        ctx.beginPath()
        ctx.arc(p.x, cloudY, p.size * 15, 0, Math.PI * 2)
        ctx.arc(p.x + p.size * 10, cloudY - p.size * 5, p.size * 12, 0, Math.PI * 2)
        ctx.arc(p.x + p.size * 20, cloudY, p.size * 14, 0, Math.PI * 2)
        ctx.arc(p.x - p.size * 10, cloudY - p.size * 3, p.size * 10, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.15})`
        ctx.fill()

        p.x += 0.3 / speedMultiplier
        
        if (p.x > canvas.width + p.size * 30) {
          p.x = -p.size * 30
          p.y = Math.random() * canvas.height * 0.5
        }
      })
    }

    // Ocean waves animation
    const drawOcean = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.001 / speedMultiplier
      
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)
        
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height * (0.5 + layer * 0.1) + 
            Math.sin(x * 0.01 + time + layer) * 30 * intensityValue +
            Math.sin(x * 0.02 + time * 0.5 + layer * 2) * 20 * intensityValue
          ctx.lineTo(x, y)
        }
        
        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        
        const alpha = (0.15 - layer * 0.03) * intensityValue
        ctx.fillStyle = `rgba(30, 100, 180, ${alpha})`
        ctx.fill()
      }
    }

    // Geometric shapes animation
    const drawGeometric = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.001 / speedMultiplier
      
      particles.forEach((p, i) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(time + i * 0.5)
        
        const sides = 3 + (i % 4)
        ctx.beginPath()
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * p.size * 8
          const y = Math.sin(angle) * p.size * 8
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = `${primaryColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()

        p.x += p.vx * 0.3 / speedMultiplier
        p.y += p.vy * 0.3 / speedMultiplier
        
        if (p.x < -50) p.x = canvas.width + 50
        if (p.x > canvas.width + 50) p.x = -50
        if (p.y < -50) p.y = canvas.height + 50
        if (p.y > canvas.height + 50) p.y = -50
      })
    }

    // Noise field animation
    const drawNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const time = Date.now() * 0.001
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % canvas.width
        const y = Math.floor((i / 4) / canvas.width)
        const noise = Math.sin(x * 0.02 + time) * Math.cos(y * 0.02 + time) * 0.5 + 0.5
        const value = noise * 50 * intensityValue
        
        imageData.data[i] = value
        imageData.data[i + 1] = value
        imageData.data[i + 2] = value + 20
        imageData.data[i + 3] = 30
      }
      
      ctx.putImageData(imageData, 0, 0)
    }

    // Vortex animation
    const drawVortex = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.002 / speedMultiplier
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 8 + time
        const radius = i * 10 + Math.sin(time + i) * 20
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        
        ctx.beginPath()
        ctx.arc(x, y, 3 + i * 0.1, 0, Math.PI * 2)
        ctx.fillStyle = `${primaryColor}${Math.floor((1 - i / 50) * intensityValue * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      }
    }

    // Glitch effect
    const drawGlitch = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (Math.random() < 0.1 * intensityValue) {
        const sliceHeight = 5 + Math.random() * 30
        const y = Math.random() * canvas.height
        const offset = (Math.random() - 0.5) * 50
        
        ctx.fillStyle = `${primaryColor}40`
        ctx.fillRect(offset, y, canvas.width, sliceHeight)
        
        ctx.fillStyle = `${secondaryColor}40`
        ctx.fillRect(-offset, y + sliceHeight, canvas.width, sliceHeight / 2)
      }
      
      for (let i = 0; i < 5; i++) {
        if (Math.random() < 0.3) {
          ctx.fillStyle = `rgba(255, 0, 0, ${0.1 * intensityValue})`
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100, 2)
          ctx.fillStyle = `rgba(0, 255, 255, ${0.1 * intensityValue})`
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100, 2)
        }
      }
    }

    // Hexagon grid animation
    const drawHexagons = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.001 / speedMultiplier
      const hexSize = 40
      const hexHeight = hexSize * Math.sqrt(3)
      
      for (let row = -1; row < canvas.height / hexHeight + 1; row++) {
        for (let col = -1; col < canvas.width / (hexSize * 1.5) + 1; col++) {
          const x = col * hexSize * 1.5
          const y = row * hexHeight + (col % 2 ? hexHeight / 2 : 0)
          const pulse = Math.sin(time + col * 0.3 + row * 0.3) * 0.5 + 0.5
          
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 6
            const hx = x + Math.cos(angle) * hexSize * 0.9
            const hy = y + Math.sin(angle) * hexSize * 0.9
            if (i === 0) ctx.moveTo(hx, hy)
            else ctx.lineTo(hx, hy)
          }
          ctx.closePath()
          ctx.strokeStyle = `${primaryColor}${Math.floor(pulse * intensityValue * 100).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // Terminal glow effect
    const drawTerminal = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const chars = '$ npm install > ./build SUCCESS ERROR WARNING DEBUG INFO'
      ctx.font = '12px monospace'
      
      particles.forEach((p) => {
        const char = chars.charAt(Math.floor(Math.random() * chars.length))
        ctx.fillStyle = `rgba(0, 255, 0, ${p.opacity})`
        ctx.fillText(char, p.x, p.y)
        
        p.y += 12 / speedMultiplier
        if (p.y > canvas.height) {
          p.y = 0
          p.x = Math.random() * canvas.width
        }
      })
      
      // Scanline effect
      const scanY = (Date.now() * 0.1) % canvas.height
      ctx.fillStyle = 'rgba(0, 255, 0, 0.03)'
      ctx.fillRect(0, scanY, canvas.width, 2)
    }

    // Dots grid animation
    const drawDotsGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const time = Date.now() * 0.002 / speedMultiplier
      const spacing = 30
      
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const distance = Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2))
          const wave = Math.sin(distance * 0.02 - time) * 0.5 + 0.5
          const size = 2 + wave * 3 * intensityValue
          
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fillStyle = `${primaryColor}${Math.floor(wave * intensityValue * 200).toString(16).padStart(2, '0')}`
          ctx.fill()
        }
      }
    }

    // Anime speed lines
    const drawSpeedLines = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2
        const length = 100 + Math.random() * 300
        const startDist = 50 + Math.random() * 100
        
        const x1 = centerX + Math.cos(angle) * startDist
        const y1 = centerY + Math.sin(angle) * startDist
        const x2 = centerX + Math.cos(angle) * (startDist + length)
        const y2 = centerY + Math.sin(angle) * (startDist + length)
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * intensityValue})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1 + Math.random() * 2
        ctx.stroke()
      }
    }

    const animate = () => {
      switch (preset) {
        case 'matrix':
        case 'code-rain':
        case 'binary':
          drawMatrix()
          break
        case 'sakura':
          drawSakura()
          break
        case 'starfield':
          drawStarfield()
          break
        case 'aurora':
          drawAurora()
          break
        case 'fireflies':
          drawFireflies()
          break
        case 'rgb-wave':
          drawRGBWave()
          break
        case 'waves':
          drawOcean()
          break
        case 'cyber-grid':
          drawCyberGrid()
          break
        case 'circuit':
          drawHexagons()
          break
        case 'snow':
          drawSnow()
          break
        case 'bokeh':
          drawBokeh()
          break
        case 'sparkles':
          drawBokeh()
          break
        case 'rain':
          drawRain()
          break
        case 'clouds':
          drawClouds()
          break
        case 'ocean':
          drawOcean()
          break
        case 'geometric':
          drawGeometric()
          break
        case 'noise':
          drawNoise()
          break
        case 'vortex':
          drawVortex()
          break
        case 'glitch':
          drawGlitch()
          break
        case 'hexagons':
          drawHexagons()
          break
        case 'terminal':
          drawTerminal()
          break
        case 'dots-grid':
          drawDotsGrid()
          break
        case 'anime-speed':
          drawSpeedLines()
          break
        case 'particles':
        default:
          drawParticles()
          break
      }
      
      animationId = requestAnimationFrame(animate)
    }

    const particleCount = preset === 'matrix' || preset === 'code-rain' || preset === 'binary' || preset === 'terminal'
      ? Math.floor(canvas.width / 20)
      : preset === 'starfield' 
      ? 200 
      : preset === 'bokeh' || preset === 'sparkles'
      ? 30
      : preset === 'clouds'
      ? 15
      : preset === 'rain'
      ? 150
      : 100

    initParticles(particleCount)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [preset, speedMultiplier, intensityValue, primaryColor, secondaryColor, contained])

  const positionClass = contained ? 'absolute inset-0' : 'fixed inset-0'

  if (['gradient-mesh', 'fluid', 'holographic', 'neon-city'].includes(preset)) {
    return (
      <div className={`${positionClass} overflow-hidden pointer-events-none`} style={{ zIndex: 0 }}>
        <motion.div
          className="absolute inset-0"
          style={{
            background: preset === 'holographic' 
              ? `linear-gradient(45deg, ${primaryColor}, ${secondaryColor}, #00ffff, ${primaryColor})`
              : preset === 'neon-city'
              ? `linear-gradient(to bottom, #0f0f23, #1a1a3e)`
              : `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40)`,
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10 * speedMultiplier,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {preset === 'gradient-mesh' && (
          <>
            <motion.div
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{ background: primaryColor, opacity: 0.3 * intensityValue }}
              animate={{
                x: ['-20%', '120%', '-20%'],
                y: ['20%', '80%', '20%'],
              }}
              transition={{ duration: 20 * speedMultiplier, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-80 h-80 rounded-full blur-3xl"
              style={{ background: secondaryColor, opacity: 0.3 * intensityValue }}
              animate={{
                x: ['120%', '-20%', '120%'],
                y: ['80%', '20%', '80%'],
              }}
              transition={{ duration: 15 * speedMultiplier, repeat: Infinity }}
            />
          </>
        )}
        {preset === 'neon-city' && (
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${i * 5 + Math.random() * 2}%`,
                  width: `${20 + Math.random() * 40}px`,
                  height: `${50 + Math.random() * 150}px`,
                  background: `linear-gradient(to top, ${i % 2 === 0 ? primaryColor : secondaryColor}80, transparent)`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${positionClass} pointer-events-none`}
      style={{ background: 'transparent', zIndex: 0 }}
    />
  )
}

const getVideoMimeType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    m4v: 'video/x-m4v',
    '3gp': 'video/3gpp',
    wmv: 'video/x-ms-wmv',
  }
  return mimeTypes[extension] || 'video/mp4'
}

export function VideoBackground({ 
  url, 
  loop = true, 
  muted = true,
  opacity = 1,
}: { 
  url: string
  loop?: boolean
  muted?: boolean
  opacity?: number
}) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop={loop}
        muted={muted}
        playsInline
        className="absolute min-w-full min-h-full object-cover"
        style={{ opacity }}
      >
        <source src={url} type={getVideoMimeType(url)} />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
