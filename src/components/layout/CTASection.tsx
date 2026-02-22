import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import {
  Rocket,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Settings,
  Zap,
  Palette,
  TrendingUp,
  Sparkles,
  Star,
} from 'lucide-react'

export function CTASection() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()

  // Logged in user sees personalized dashboard CTA
  if (currentUser) {
    return (
      <section className="relative overflow-hidden py-16 sm:py-20">
        {/* Background with gradient mesh */}
        <div
          className="absolute inset-0"
          style={{ background: theme.colors.backgroundSecondary }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${theme.colors.primary}20 0%, transparent 50%),
                         radial-gradient(ellipse at 80% 50%, ${theme.colors.accent}20 0%, transparent 50%)`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glass card */}
            <div
              className="relative rounded-3xl p-8 sm:p-10 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.card}90, ${theme.colors.card}70)`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{ background: theme.colors.primary }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15"
                style={{ background: theme.colors.accent }}
              />

              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left: Greeting & Avatar */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden"
                        style={{
                          background: currentUser.profile?.avatar
                            ? `url(${currentUser.profile.avatar}) center/cover`
                            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                          color: 'white',
                        }}
                      >
                        {!currentUser.profile?.avatar &&
                          (currentUser.name || currentUser.username)
                            .charAt(0)
                            .toUpperCase()}
                      </div>
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles size={12} className="text-white" />
                      </motion.div>
                    </motion.div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        {t('home.cta.loggedIn.greeting')}
                      </p>
                      <h3
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {currentUser.name || currentUser.username}
                      </h3>
                    </div>
                  </div>
                  <p
                    className="text-base max-w-md mx-auto lg:mx-0"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('home.cta.loggedIn.subtitle')}
                  </p>
                </div>

                {/* Right: Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/$username"
                    params={{ username: currentUser.username }}
                  >
                    <motion.button
                      className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-white min-w-[160px]"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        boxShadow: `0 8px 32px ${theme.colors.primary}30`,
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink size={18} />
                      {t('home.cta.loggedIn.viewPage')}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </motion.button>
                  </Link>
                  <Link to="/profile" search={{ tab: 'overview' }}>
                    <motion.button
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold min-w-[140px]"
                      style={{
                        background: `${theme.colors.primary}15`,
                        border: `1px solid ${theme.colors.primary}30`,
                        color: theme.colors.foreground,
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BarChart3
                        size={18}
                        style={{ color: theme.colors.primary }}
                      />
                      {t('home.cta.loggedIn.analytics')}
                    </motion.button>
                  </Link>
                  <Link to="/profile">
                    <motion.button
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold min-w-[140px]"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Settings
                        size={18}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                      {t('home.cta.loggedIn.settings')}
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // Guest CTA - modern split design
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Animated background */}
      <div
        className="absolute inset-0"
        style={{ background: theme.colors.background }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${theme.colors.primary}15 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 100%, ${theme.colors.accent}15 0%, transparent 50%)`,
        }}
      />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-[10%] w-3 h-3 rounded-full"
        style={{ background: theme.colors.primary }}
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 right-[15%] w-2 h-2 rounded-full"
        style={{ background: theme.colors.accent }}
        animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 left-[20%] w-4 h-4 rounded-full"
        style={{ background: theme.colors.accent }}
        animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <Star size={14} style={{ color: theme.colors.primary }} />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.primary }}
            >
              {t('home.cta.noCreditCard')}
            </span>
          </motion.div>

          {/* Headline */}
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            style={{ color: theme.colors.foreground }}
          >
            {t('home.cta.guest.title')}
          </h2>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('home.cta.guest.subtitle')}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: Zap, label: t('home.cta.guest.features.free') },
              { icon: Palette, label: t('home.cta.guest.features.themes') },
              {
                icon: TrendingUp,
                label: t('home.cta.guest.features.analytics'),
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <feature.icon
                  size={16}
                  style={{ color: theme.colors.primary }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-up">
              <motion.button
                className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-lg min-w-[220px] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 12px 40px ${theme.colors.primary}35`,
                }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket size={20} />
                  {t('home.cta.guest.createPage')}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                  }}
                />
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg min-w-[180px]"
                style={{
                  background: 'transparent',
                  border: `2px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
                whileHover={{
                  scale: 1.03,
                  y: -3,
                  borderColor: theme.colors.primary,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t('home.cta.guest.learnMore')}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
