import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { resendVerificationEmailFn } from '@/server/functions/auth'
import { useAuth } from '@/hooks/use-auth'
import {
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'

export function EmailVerificationIndicator() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const resendVerification = useServerFn(resendVerificationEmailFn)
  const [showTooltip, setShowTooltip] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const resendMutation = useMutation({
    mutationFn: async () => {
      return await resendVerification({})
    },
    onSuccess: () => {
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
  })

  // Don't show if user is verified or not logged in
  if (!currentUser || currentUser.emailVerified) {
    return null
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => resendMutation.mutate()}
        disabled={resendMutation.isPending || cooldown > 0}
        className="relative p-2 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {resendMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mail className="w-4 h-4" />
        )}

        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'rgba(245, 158, 11, 0.3)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl shadow-xl z-50"
            style={{
              background: 'var(--background-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-200 mb-1">
                  {t('emailVerification.indicator.title')}
                </p>
                <p className="text-xs text-amber-300/70 mb-3">
                  {t('emailVerification.indicator.description')}
                </p>

                {resendMutation.isSuccess && cooldown > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      {t('emailVerification.indicator.sent')} ({cooldown}s)
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending || cooldown > 0}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                    }}
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>{t('emailVerification.indicator.resend')}</span>
                  </button>
                )}
              </div>
            </div>

            {resendMutation.isError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-red-400"
              >
                {t('emailVerification.indicator.error')}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
