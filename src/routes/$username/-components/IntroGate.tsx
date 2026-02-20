import { motion } from 'motion/react'
import type { IntroGateSettings } from '@/server/db/schema'

interface IntroGateProps {
  introGate: IntroGateSettings
  avatar?: string | null
  onEnter: () => void
}

export function IntroGate({ introGate, avatar, onEnter }: IntroGateProps) {
  return (
    <motion.div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center p-6 cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onEnter}
      style={{
        background: introGate.style === 'cinematic'
          ? 'rgba(0,0,0,0.92)'
          : introGate.style === 'overlay'
            ? 'rgba(0,0,0,0.8)'
            : introGate.style === 'minimal'
              ? 'rgba(0,0,0,0.4)'
              : 'rgba(0,0,0,0.6)',
        backdropFilter: introGate.style === 'blur' ? 'blur(24px)' : introGate.style === 'minimal' ? 'blur(12px)' : undefined,
      }}
    >
      {introGate.showAvatar && avatar && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-white/15 mb-6"
        >
          <img src={avatar} alt="" className="w-full h-full object-cover" />
        </motion.div>
      )}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/70 text-center text-base sm:text-lg font-medium tracking-wide"
      >
        {introGate.text || introGate.buttonText || 'Click Anywhere'}
      </motion.p>
    </motion.div>
  )
}
