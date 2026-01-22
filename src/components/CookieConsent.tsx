import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Cookie, Settings, X, Check, Shield } from 'lucide-react'

type CookiePreferences = {
  essential: boolean
  functional: boolean
  analytics: boolean
}

const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_PREFERENCES_KEY = 'cookie-preferences'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setIsVisible(false)
  }

  const acceptAll = () => {
    saveConsent({ essential: true, functional: true, analytics: true })
  }

  const declineOptional = () => {
    saveConsent({ essential: true, functional: false, analytics: false })
  }

  const saveCustom = () => {
    saveConsent(preferences)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
      >
        <div
          className="max-w-5xl mx-auto rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{
            background: 'rgba(15, 15, 25, 0.95)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow:
              '0 -10px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.1)',
          }}
        >
          <div
            className="h-1 w-full"
            style={{
              background:
                'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #ec4899)',
            }}
          />

          <AnimatePresence mode="wait">
            {!showCustomize ? (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(251, 146, 60, 0.15)' }}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Cookie size={24} style={{ color: '#fb923c' }} />
                    </motion.div>
                    <div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        🍪 We use cookies
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        We use cookies to enhance your browsing experience,
                        serve personalized content, and analyze our traffic. By
                        clicking "Accept All", you consent to our use of
                        cookies.{' '}
                        <Link
                          to="/privacy"
                          className="underline hover:no-underline"
                          style={{ color: '#a78bfa' }}
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <Settings size={16} />
                      Customize
                    </button>
                    <button
                      onClick={declineOptional}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <X size={16} />
                      Decline
                    </button>
                    <motion.button
                      onClick={acceptAll}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check size={16} />
                      Accept All
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="customize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                    >
                      <Settings size={20} style={{ color: '#a78bfa' }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Cookie Preferences
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        Manage your cookie settings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    {
                      id: 'essential',
                      name: 'Essential Cookies',
                      description:
                        'Required for the website to function. Cannot be disabled.',
                      required: true,
                      icon: Shield,
                      color: '#10b981',
                    },
                    {
                      id: 'functional',
                      name: 'Functional Cookies',
                      description:
                        'Remember your preferences like theme and language.',
                      required: false,
                      icon: Settings,
                      color: '#3b82f6',
                    },
                    {
                      id: 'analytics',
                      name: 'Analytics Cookies',
                      description:
                        'Help us understand how visitors interact with our website.',
                      required: false,
                      icon: Cookie,
                      color: '#f59e0b',
                    },
                  ].map((cookie) => (
                    <div
                      key={cookie.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${cookie.color}20` }}
                        >
                          <cookie.icon
                            size={18}
                            style={{ color: cookie.color }}
                          />
                        </div>
                        <div>
                          <h4
                            className="font-medium text-sm"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {cookie.name}
                          </h4>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--foreground-muted)' }}
                          >
                            {cookie.description}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            preferences[cookie.id as keyof CookiePreferences]
                          }
                          onChange={(e) =>
                            !cookie.required &&
                            setPreferences({
                              ...preferences,
                              [cookie.id]: e.target.checked,
                            })
                          }
                          disabled={cookie.required}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-purple-500/50 transition-all"
                          style={{
                            background: preferences[
                              cookie.id as keyof CookiePreferences
                            ]
                              ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                              : 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <motion.div
                            className="w-5 h-5 bg-white rounded-full shadow-lg"
                            animate={{
                              x: preferences[
                                cookie.id as keyof CookiePreferences
                              ]
                                ? 22
                                : 2,
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                            style={{ marginTop: 2 }}
                          />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/5"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={saveCustom}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check size={16} />
                    Save Preferences
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (stored) {
      setPreferences(JSON.parse(stored))
    }
  }, [])

  return preferences
}
