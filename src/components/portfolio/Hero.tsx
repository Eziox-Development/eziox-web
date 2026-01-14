import { siteConfig } from '@/lib/site-config'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  compact?: boolean
}

// Floating particle component for anime effect
function FloatingParticle({
  delay,
  duration,
  x,
  y,
  size,
}: {
  delay: number
  duration: number
  x: string
  y: string
  size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background:
          'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        filter: 'blur(1px)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
        y: [0, -30, -60],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  )
}

export function Hero({
  title = siteConfig.header.title,
  subtitle = siteConfig.header.subtitle,
  image = siteConfig.header.image,
  imageAlt = siteConfig.header.imageAlt,
  compact = false,
}: HeroProps) {
  // Generate random particles for anime effect
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    duration: 3 + Math.random() * 2,
    x: `${10 + Math.random() * 80}%`,
    y: `${60 + Math.random() * 30}%`,
    size: 4 + Math.random() * 8,
  }))

  return (
    <section
      className={`relative overflow-hidden ${compact ? 'pt-24 pb-12' : 'pt-32 pb-20 md:pt-40 md:pb-28'}`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {/* Animated background image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: image ? `url(${image})` : undefined,
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          role="img"
          aria-label={imageAlt}
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.5) 0%,
              rgba(0, 0, 0, 0.3) 40%,
              rgba(0, 0, 0, 0.4) 70%,
              var(--background) 100%
            )`,
          }}
        />

        {/* Anime-style color overlay with glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(var(--primary-rgb, 99, 102, 241), 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(var(--accent-rgb, 168, 85, 247), 0.15) 0%, transparent 50%)
            `,
          }}
        />

        {/* Animated scan line effect (anime style) */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
          animate={{ backgroundPositionY: ['0px', '100px'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating particles */}
      {!compact &&
        particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}

      {/* Content */}
      <div
        className="relative max-w-6xl mx-auto px-4 sm:px-6"
        style={{ zIndex: 10 }}
      >
        <div className={`max-w-3xl ${compact ? '' : 'text-center mx-auto'}`}>
          {/* Decorative sparkle icon */}
          {!compact && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div
                className="p-3 rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  boxShadow:
                    '0 0 30px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
                }}
              >
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: 'var(--primary-foreground)' }}
                />
              </div>
            </motion.div>
          )}

          {/* Title with gradient text effect */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`font-bold leading-tight ${
              compact
                ? 'text-3xl md:text-4xl'
                : 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
            }`}
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
              textShadow:
                '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`mt-6 md:mt-8 leading-relaxed ${
                compact
                  ? 'text-base md:text-lg'
                  : 'text-lg md:text-xl lg:text-2xl'
              }`}
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-body)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
                opacity: 0.9,
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Animated underline decoration */}
          {!compact && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-8 mx-auto h-1 w-24 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)',
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, var(--background), transparent)`,
          zIndex: 5,
        }}
      />

      {/* Side glow effects */}
      <div
        className="absolute top-1/2 -left-20 w-40 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{ background: 'var(--primary)', transform: 'translateY(-50%)' }}
      />
      <div
        className="absolute top-1/2 -right-20 w-40 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{ background: 'var(--accent)', transform: 'translateY(-50%)' }}
      />
    </section>
  )
}
