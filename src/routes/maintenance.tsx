import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Construction, Clock, ArrowLeft } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/maintenance')({
  head: () => ({
    meta: [
      { title: `Maintenance | ${siteConfig.metadata.title}` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: MaintenancePage,
})

function MaintenancePage() {
  const message =
    'We are currently performing maintenance to improve your experience. Please check back soon.'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'linear-gradient(135deg, #030305 0%, #0c0c10 50%, #030305 100%)',
      }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(236, 72, 153, 0.06)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(139, 92, 246, 0)',
              '0 0 40px 10px rgba(139, 92, 246, 0.2)',
              '0 0 0 0 rgba(139, 92, 246, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Construction size={48} style={{ color: '#8b5cf6' }} />
          </motion.div>
        </motion.div>

        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: '#fafafa' }}
        >
          Under Maintenance
        </h1>

        <p
          className="text-lg mb-8 leading-relaxed"
          style={{ color: '#71717a' }}
        >
          {message}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <Clock size={20} style={{ color: '#8b5cf6' }} />
          <span style={{ color: '#c4b5fd' }}>We'll be back soon</span>
        </motion.div>

        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <p className="text-sm mb-4" style={{ color: '#71717a' }}>
            We apologize for any inconvenience. Our team is working hard to
            bring the site back online as soon as possible.
          </p>

          <div className="flex items-center justify-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <ArrowLeft size={16} />
              Try Again
            </a>
          </div>
        </div>

        <p className="mt-8 text-xs" style={{ color: '#52525b' }}>
          {siteConfig.metadata.title} &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}
