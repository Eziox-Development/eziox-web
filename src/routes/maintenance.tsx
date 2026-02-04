import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Construction, Clock, Calendar, RefreshCw, Mail } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { getMaintenanceStatusFn } from '@/server/functions/maintenance'

// Simple markdown parser for maintenance messages
function parseMarkdown(text: string) {
  const processed = text
    // Headers
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold text-purple-400 mb-3 mt-4">$1</h3>',
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-bold text-purple-300 mb-3 mt-5">$1</h2>',
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold text-purple-200 mb-4 mt-6">$1</h1>',
    )
    // Bold
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-white">$1</strong>',
    )
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    // Bullet points - handle lists properly
    .replace(
      /^- (.*$)/gim,
      '<li class="flex items-center gap-2 mb-0.5 text-gray-300"><span class="text-purple-400 shrink-0">•</span><span>$1</span></li>',
    )
    // Wrap lists in ul
    .replace(/(<li.*<\/li>)/gs, '<ul class="space-y-0.5 mb-2 ml-4">$1</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-300 leading-relaxed">')
    .replace(/\n/g, '<br />')
    // Wrap paragraphs
    .replace(
      /^(?!<[hul]).*$/gm,
      '<p class="mb-4 text-gray-300 leading-relaxed">$&</p>',
    )
    // Clean up empty paragraphs
    .replace(/<p class="mb-4 text-gray-300 leading-relaxed"><\/p>/g, '')
    // Fix nested tags
    .replace(/<p class="mb-4 text-gray-300 leading-relaxed"><h/g, '<h')
    .replace(/<\/h[1-6]><\/p>/g, '</h')
    .replace(/<p class="mb-4 text-gray-300 leading-relaxed"><ul/g, '<ul')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p class="mb-4 text-gray-300 leading-relaxed"><li/g, '<li')
    .replace(/<\/li><\/p>/g, '</li>')

  return processed
}

export const Route = createFileRoute('/maintenance')({
  head: () => ({
    meta: [
      { title: `Maintenance | ${siteConfig.metadata.title}` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  loader: async () => {
    const maintenanceStatus = await getMaintenanceStatusFn()
    return { maintenanceStatus }
  },
  component: MaintenancePage,
})

function MaintenancePage() {
  const { maintenanceStatus } = Route.useLoaderData()
  const message =
    maintenanceStatus?.message ||
    'We are currently performing maintenance to improve your experience. Please check back soon.'

  const renderedMessage = parseMarkdown(message)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl bg-purple-500/10"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl bg-pink-500/10"
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Status Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center"
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
                <Construction className="w-10 h-10 text-purple-400" />
              </motion.div>
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-3">
              Under Maintenance
            </h1>
            <p className="text-gray-400 text-lg">
              We're working hard to improve your experience
            </p>
          </div>

          {/* Message Content */}
          <div className="bg-slate-800/30 rounded-2xl p-6 mb-6 border border-slate-700/50">
            <div
              className="space-y-2 text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedMessage }}
            />
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {maintenanceStatus?.estimatedEndTime ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-purple-300 font-medium">Expected Back</p>
                    <p className="text-purple-200 text-sm">
                      {new Date(
                        maintenanceStatus.estimatedEndTime,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-blue-300 font-medium">Status</p>
                    <p className="text-blue-200 text-sm">We'll be back soon</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Manual Refresh</p>
                  <p className="text-green-200 text-sm">
                    Click button to check status
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>

            <a
              href="mailto:support@eziox.link"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} {siteConfig.metadata.title}. All rights
            reserved.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
