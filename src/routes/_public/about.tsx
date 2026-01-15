/**
 * About Page
 * Modern design showcasing the platform and team
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPlatformStatsFn } from '@/server/functions/stats'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sparkles,
  Zap,
  Heart,
  Globe,
  Users,
  Shield,
  Rocket,
  Target,
  Code,
  Github,
  ArrowRight,
  CheckCircle,
  Crown,
} from 'lucide-react'

const DiscordIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export const Route = createFileRoute('/_public/about')({
  component: AboutPage,
})

function AboutPage() {
  const getPlatformStats = useServerFn(getPlatformStatsFn)
  
  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => getPlatformStats(),
  })

  const values = [
    {
      icon: Heart,
      title: 'User First',
      description: 'Everything we build starts with our users. Your success is our success.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is yours. We never sell or share your personal information.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Speed matters. We optimize every millisecond of your experience.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Code,
      title: 'Open Innovation',
      description: 'We embrace modern technology and continuously improve our platform.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  const stats = [
    { value: platformStats?.totalUsers?.toLocaleString() || '0', label: 'Active Users' },
    { value: platformStats?.totalLinks?.toLocaleString() || '0', label: 'Links Created' },
    { value: platformStats?.totalCountries?.toLocaleString() || '0', label: 'Countries' },
    { value: '99.9%', label: 'Uptime' },
  ]

  const team = [
    {
      name: 'Saito',
      role: 'Founder & Developer',
      avatar: 'https://eziox.link/images/avatars/saito.png',
      bio: 'Full-stack developer passionate about creating beautiful, functional web experiences.',
      isOwner: true,
      links: {
        github: 'https://github.com/XSaitoKungX',
        website: 'https://eziox.link',
        discord: 'https://discord.com/invite/KD84DmNA89',
      },
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(99, 102, 241, 0.08))' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <Badge variant="outline" className="mb-4">About Us</Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Building the Future of{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              Bio Links
            </span>
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Eziox is a modern bio link platform that helps creators, influencers, and businesses 
            share everything they create, curate, and sell from one simple link.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-2xl text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            />
            <Card className="relative overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="outline" className="mb-4">
                      <Target size={14} className="mr-1" />
                      Our Mission
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                      Empowering Creators Worldwide
                    </h2>
                    <p className="text-lg mb-6" style={{ color: 'var(--foreground-muted)' }}>
                      We believe everyone deserves a beautiful, professional online presence. 
                      Our mission is to make it easy for anyone to create and share their digital identity.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Free for everyone, forever',
                        'No coding required',
                        'Works on all devices',
                        'Real-time analytics',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ color: 'var(--foreground)' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-center">
                    <motion.div
                      className="w-64 h-64 rounded-3xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Rocket size={100} className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Heart size={14} className="mr-1" />
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              What We Stand For
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Our core values guide everything we do, from product decisions to how we treat our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:scale-[1.02] transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${value.gradient}`}>
                      <value.icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {value.title}
                    </h3>
                    <p style={{ color: 'var(--foreground-muted)' }}>
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users size={14} className="mr-1" />
              Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Meet the Creator
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Eziox is built with passion by a solo developer dedicated to creating the best bio link experience.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {team.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-32 h-32 mx-auto">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {member.isOwner && (
                        <div 
                          className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                        >
                          <Crown size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                      {member.name}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--primary)' }}>
                      {member.role}
                    </p>
                    <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
                      {member.bio}
                    </p>
                    
                    <div className="flex justify-center gap-3">
                      {member.links.github && (
                        <motion.a
                          href={member.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--background-secondary)' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github size={20} style={{ color: 'var(--foreground)' }} />
                        </motion.a>
                      )}
                      {member.links.discord && (
                        <motion.a
                          href={member.links.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--background-secondary)' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <DiscordIcon size={20} />
                        </motion.a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-4">
                  <Code size={14} className="mr-1" />
                  Tech Stack
                </Badge>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Built with Modern Technology
                </h2>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'React', 'TypeScript', 'TanStack Router', 'TanStack Query',
                  'Tailwind CSS', 'Drizzle ORM', 'PostgreSQL', 'Vercel',
                ].map((tech) => (
                  <motion.div
                    key={tech}
                    className="px-4 py-2 rounded-lg"
                    style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {tech}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            />
            <Card className="relative overflow-hidden">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <Globe size={40} className="text-white" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Ready to Join Us?
                </h2>
                <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                  Create your free bio link page today and join thousands of creators worldwide.
                </p>
                
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
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
