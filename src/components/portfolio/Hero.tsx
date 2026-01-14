import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Link as LinkIcon, Sparkles, ArrowRight, Users, MousePointerClick, Globe } from 'lucide-react'

interface HeroProps {
  subtitle?: string
  showCTA?: boolean
  showStats?: boolean
  stats?: {
    users: number
    clicks: number
    countries: number
  }
}

export function Hero({
  subtitle = 'Create your bio page and share all your content, social links, and more with one simple link.',
  showCTA = true,
  showStats = false,
  stats,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: 'var(--primary)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                             linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
            border: '1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2)',
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
            Free to get started
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
        >
          <span style={{ color: 'var(--foreground)' }}>One Link for </span>
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Everything
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              to="/sign-up"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white',
                boxShadow: '0 10px 40px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              }}
            >
              <LinkIcon size={20} />
              Create Your Bio Link
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <Users size={20} />
              Explore Creators
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 sm:gap-12"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users size={18} style={{ color: 'var(--primary)' }} />
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {stats.users.toLocaleString()}+
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Creators</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MousePointerClick size={18} style={{ color: 'var(--accent)' }} />
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {stats.clicks.toLocaleString()}+
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Link Clicks</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Globe size={18} style={{ color: 'var(--primary)' }} />
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {stats.countries}+
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Countries</span>
            </div>
          </motion.div>
        )}

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 relative"
        >
          <div
            className="max-w-sm mx-auto p-6 rounded-3xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Mock bio card */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white',
                }}
              >
                E
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                Your Name
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                @yourname
              </p>
              <div className="space-y-2">
                {['Website', 'Twitter', 'GitHub'].map((link, i) => (
                  <div
                    key={link}
                    className="p-3 rounded-xl text-sm font-medium"
                    style={{
                      background: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      opacity: 1 - i * 0.15,
                    }}
                  >
                    {link}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl opacity-40"
            style={{ background: 'var(--primary)' }}
          />
          <div
            className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-2xl opacity-30"
            style={{ background: 'var(--accent)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
