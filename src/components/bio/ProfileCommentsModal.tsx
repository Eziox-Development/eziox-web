import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Send,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  MessageSquarePlus,
  AtSign,
} from 'lucide-react'

interface ProfileCommentsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
  profileUsername?: string
}

export function ProfileCommentsModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  isError,
  errorMessage,
  profileUsername,
}: ProfileCommentsModalProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const maxLength = 500
  const charCount = content.length
  const charPercentage = (charCount / maxLength) * 100
  const isNearLimit = charPercentage > 80
  const isAtLimit = charPercentage >= 100

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setContent('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !isPending) {
      onSubmit(content.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (content.trim() && !isPending) {
        onSubmit(content.trim())
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden"
          >
            
            {/* Main container */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#1e1e2e] to-[#16161f] border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10"
                    >
                      <MessageSquarePlus className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {t('bioPage.comments.writeComment')}
                      </h3>
                      {profileUsername && (
                        <p className="text-sm text-white/40 flex items-center gap-1 mt-0.5">
                          <AtSign className="w-3 h-3" />
                          {profileUsername}
                        </p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="px-6 pb-6">
                {/* Textarea container */}
                <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('bioPage.comments.placeholder')}
                      maxLength={maxLength}
                      rows={6}
                      className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/40 transition-colors text-[15px] leading-relaxed"
                    />

                    {/* Sparkle decoration */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: content.length > 0 ? 1 : 0 }}
                      className="absolute top-3 right-3"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400/50" />
                    </motion.div>
                </div>

                {/* Character counter */}
                <div className="flex items-center justify-between mt-3 mb-4">
                  <div className="flex items-center gap-2">
                    {/* Progress ring */}
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-white/10"
                        />
                        <motion.circle
                          cx="16"
                          cy="16"
                          r="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={75.4}
                          initial={{ strokeDashoffset: 75.4 }}
                          animate={{
                            strokeDashoffset:
                              75.4 - (75.4 * charPercentage) / 100,
                          }}
                          className={
                            isAtLimit
                              ? 'text-red-400'
                              : isNearLimit
                                ? 'text-amber-400'
                                : 'text-purple-400'
                          }
                        />
                      </svg>
                      <span
                        className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${
                          isAtLimit
                            ? 'text-red-400'
                            : isNearLimit
                              ? 'text-amber-400'
                              : 'text-white/50'
                        }`}
                      >
                        {isNearLimit ? maxLength - charCount : ''}
                      </span>
                    </div>

                    <span
                      className={`text-xs transition-colors ${
                        isAtLimit
                          ? 'text-red-400'
                          : isNearLimit
                            ? 'text-amber-400'
                            : 'text-white/30'
                      }`}
                    >
                      {charCount}/{maxLength}
                    </span>
                  </div>

                  <span className="text-xs text-white/20">
                    {t('bioPage.comments.submitHint', {
                      defaultValue: '⌘/Ctrl + Enter to submit',
                    })}
                  </span>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          {errorMessage || t('bioPage.comments.errors.failed')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white/80 transition-all duration-200 border border-white/5"
                  >
                    {t('common.cancel')}
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={!content.trim() || isPending}
                    whileHover={{ scale: content.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: content.trim() ? 0.98 : 1 }}
                    className="relative flex-1 py-3 px-4 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {/* Button gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300" />

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    {/* Button content */}
                    <span className="relative flex items-center justify-center gap-2">
                      {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('bioPage.comments.submit')}
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
