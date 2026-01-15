/**
 * Eziox Landing Page
 * Modern bio link platform homepage with glassmorphism design
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getTopUsersFn } from '@/server/functions/users'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Users,
  Shield,
  MousePointerClick,
  Gift,
  Rocket,
  CheckCircle,
  Crown,
} from 'lucide-react'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  const { currentUser } = useAuth()
  const getTopUsers = useServerFn(getTopUsersFn)
  const { data: topUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: () => getTopUsers({}),
  })

  const features = [
    {
      icon: LinkIcon,
      title: 'One Link for Everything',
      description: 'Share all your important links in one beautiful, customizable page.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track clicks, views, and engagement with detailed live statistics.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Palette,
      title: 'Custom Themes',
      description: 'Express yourself with beautiful themes and personalization options.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed. Your page loads instantly, every time.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Gift,
      title: 'Referral Rewards',
      description: 'Earn points by inviting friends to join the platform.',
      gradient: 'from-violet-500 to-purple-500',
    },
  ]

  const stats = [
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Links Created', value: '50K+', icon: LinkIcon },
    { label: 'Daily Clicks', value: '100K+', icon: MousePointerClick },
    { label: 'Countries', value: '150+', icon: Globe },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div
            className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1))' }}
            animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              The Future of Bio Links
            </span>
            <Badge variant="secondary" className="ml-2">New</Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            One Link.{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              Infinite
            </span>{' '}
            Possibilities.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Create your personalized bio link page in seconds. Share everything you create, 
            curate, and sell from one simple link.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {currentUser ? (
              <Link to="/profile">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-xl font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/sign-up">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-xl font-semibold"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    Get Started Free
                    <Rocket className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-xl font-semibold"
                  >
                    Explore Creators
                    <ChevronRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-2xl text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <stat.icon size={24} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Powerful features to help you grow your online presence and connect with your audience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:scale-[1.02] transition-transform cursor-default">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient}`}>
                      <feature.icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--foreground-muted)' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      {topUsers && topUsers.length > 0 && (
        <section className="py-20 px-4" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">
                <Trophy size={14} className="mr-1" />
                Leaderboard
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Top Creators
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                Join thousands of creators who are already using Eziox to share their content.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {topUsers.slice(0, 6).map((item, index) => {
                const isOwner = item.user.role === 'admin'
                return (
                  <motion.div
                    key={item.user.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to="/$username" params={{ username: item.user.username }}>
                      <Card className="hover:scale-[1.02] transition-transform">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="w-14 h-14">
                                <AvatarImage src={item.profile?.avatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                  {(item.user.name || item.user.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {index < 3 && (
                                <div 
                                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{ 
                                    background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7f32',
                                    color: 'white'
                                  }}
                                >
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                  {item.user.name || item.user.username}
                                </p>
                                {isOwner && <Crown size={14} className="text-amber-500" />}
                              </div>
                              <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                                @{item.user.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold" style={{ color: 'var(--primary)' }}>
                                {item.stats?.score?.toLocaleString() || 0}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                points
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center">
              <Link to="/leaderboard">
                <Button variant="outline" size="lg" className="rounded-xl">
                  View Full Leaderboard
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Get Started in 3 Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', description: 'Sign up for free in seconds with just your email.', icon: Users },
              { step: '2', title: 'Add Your Links', description: 'Add all your important links and customize your page.', icon: LinkIcon },
              { step: '3', title: 'Share Everywhere', description: 'Share your unique link on all your social platforms.', icon: Globe },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  {item.description}
                </p>
                {index < 2 && (
                  <ArrowRight 
                    size={24} 
                    className="hidden md:block absolute top-10 -right-4 transform translate-x-1/2" 
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl text-center overflow-hidden"
          >
            {/* Glow Effect */}
            <div
              className="absolute inset-0 blur-3xl opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            />
            
            <div 
              className="relative z-10 p-12 rounded-2xl"
              style={{ 
                background: 'rgba(var(--card-rgb, 30, 30, 30), 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >
                <Rocket size={40} className="text-white" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                Join thousands of creators and start building your online presence today. It's free!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {currentUser ? (
                  <Link to="/links">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 rounded-xl font-semibold"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      Manage Your Links
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/sign-up">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 rounded-xl font-semibold"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      Create Your Page Now
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-8">
                {[
                  { icon: CheckCircle, text: 'Free Forever' },
                  { icon: Shield, text: 'Secure' },
                  { icon: Zap, text: 'Fast Setup' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <badge.icon size={16} style={{ color: 'var(--primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
