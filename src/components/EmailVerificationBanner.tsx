import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { resendVerificationEmailFn } from '@/server/functions/auth'

interface EmailVerificationBannerProps {
  email: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({
  email,
  onDismiss,
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [isDismissed, setIsDismissed] = useState(false)
  const resendEmail = useServerFn(resendVerificationEmailFn)

  const handleResend = async () => {
    if (isResending) return
    setIsResending(true)
    setResendStatus('idle')

    try {
      await resendEmail({ data: undefined })
      setResendStatus('success')
      setTimeout(() => setResendStatus('idle'), 5000)
    } catch {
      setResendStatus('error')
      setTimeout(() => setResendStatus('idle'), 5000)
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden"
      >
        <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="shrink-0 p-2 rounded-full bg-amber-500/20">
                  <Mail className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-sm font-medium text-amber-200">
                    Verify your email address
                  </span>
                  <span className="text-xs text-amber-300/70 hidden sm:inline">
                    •
                  </span>
                  <span className="text-xs text-amber-300/70">
                    Check <strong>{email}</strong> for a verification link
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {resendStatus === 'success' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-emerald-400"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Email sent!</span>
                  </motion.div>
                ) : resendStatus === 'error' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-red-400"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Failed to send</span>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend email'
                    )}
                  </button>
                )}

                <a
                  href="/settings"
                  className="text-xs text-amber-300/70 hover:text-amber-200 transition-colors"
                >
                  Change email
                </a>

                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full hover:bg-amber-500/20 transition-colors text-amber-300/70 hover:text-amber-200"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
