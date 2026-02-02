import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { resendVerificationEmailFn } from '@/server/functions/auth'
import { useAuth } from '@/hooks/use-auth'
import { AlertTriangle, CheckCircle, Loader2, X, RefreshCw } from 'lucide-react'

export function EmailVerificationBanner() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const resendVerification = useServerFn(resendVerificationEmailFn)
  const [dismissed, setDismissed] = useState(false)
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

  // Don't show if user is verified, not logged in, or dismissed
  if (!currentUser || currentUser.emailVerified || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.1))',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245, 158, 11, 0.2)' }}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium text-amber-200">
                  {t('emailVerification.banner.title')}
                </span>
                <span className="text-xs text-amber-300/70 hidden sm:inline">
                  {t('emailVerification.banner.description')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {resendMutation.isSuccess && cooldown > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-300">
                    {t('emailVerification.banner.sent')} ({cooldown}s)
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending || cooldown > 0}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: 'rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {t('emailVerification.banner.resend')}
                  </span>
                </motion.button>
              )}

              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {resendMutation.isError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-red-400"
            >
              {t('emailVerification.banner.error')}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
