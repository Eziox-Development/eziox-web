/**
 * Eziox Landing Page
 * Modern bio link platform homepage
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import {
  Link as LinkIcon,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  Trophy,
  Globe,
  Palette,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  const getTopUsers = useServerFn(getTopUsersFn)
  const { data: topUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: () => getTopUsers({}),
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at top, var(--primary) 0%, transparent 50%)',
            opacity: 0.15,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Your Bio, Your Way
              </span>
            </motion.div>

            {/* Main heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: 'var(--foreground)' }}
            >
              One Link for{' '}
              <span style={{ color: 'var(--primary)' }}>Everything</span>
            </h1>

            <p
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Create your personalized bio page with custom links, track analytics,
              and share everything you create with a single link.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <Trophy size={20} />
                View Leaderboard
              </Link>
            </div>

            {/* Example URL */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
            >
              <Globe size={16} style={{ color: 'var(--foreground-muted)' }} />
              <span style={{ color: 'var(--foreground-muted)' }}>eziox.link/</span>
              <span style={{ color: 'var(--primary)' }}>yourname</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Powerful features to help you stand out
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: LinkIcon,
                title: 'Unlimited Links',
                description: 'Add as many links as you want to your bio page',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track views, clicks, and engagement in real-time',
              },
              {
                icon: Palette,
                title: 'Customization',
                description: 'Personalize your page with themes and colors',
              },
              {
                icon: Zap,
                title: 'URL Shortener',
                description: 'Create short, memorable links for any URL',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                >
                  <feature.icon size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Users Section */}
      {topUsers && topUsers.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Top Creators
              </h2>
              <p style={{ color: 'var(--foreground-muted)' }}>
                Join our growing community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {topUsers.map((item, index) => (
                <motion.div
                  key={item.user.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to="/u/$username"
                    params={{ username: item.user.username }}
                    className="block p-4 rounded-2xl transition-all hover:scale-105"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{
                          background: item.profile?.avatar
                            ? `url(${item.profile.avatar}) center/cover`
                            : `linear-gradient(135deg, ${item.profile?.accentColor || 'var(--primary)'}, var(--accent))`,
                          color: 'white',
                        }}
                      >
                        {!item.profile?.avatar && (item.user.name?.[0] || item.user.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {item.user.name || item.user.username}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                          @{item.user.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                View all creators
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Get started in minutes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up with your email and choose your unique username',
              },
              {
                step: '2',
                title: 'Add Your Links',
                description: 'Add social media, websites, and any links you want to share',
              },
              {
                step: '3',
                title: 'Share Your Page',
                description: 'Share your eziox.link/username with the world',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-white/80">
              Create your free bio page today and start sharing
            </p>
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
              style={{ background: 'white', color: 'var(--primary)' }}
            >
              Create Your Page
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
