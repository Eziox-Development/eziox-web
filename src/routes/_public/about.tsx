/**
 * About Page
 * Modern design showcasing the platform and team
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
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
  Twitter,
  ArrowRight,
  CheckCircle,
  Crown,
} from 'lucide-react'

export const Route = createFileRoute('/_public/about')({
  component: AboutPage,
})

function AboutPage() {
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
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Links Created' },
    { value: '150+', label: 'Countries' },
    { value: '99.9%', label: 'Uptime' },
  ]

  const team = [
    {
      name: 'Saitama',
      role: 'Founder & Developer',
      avatar: null,
      bio: 'Full-stack developer passionate about creating beautiful, functional web experiences.',
      isOwner: true,
      links: {
        github: 'https://github.com/XSaitoKungX',
        twitter: 'https://twitter.com/eziox',
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
                      {member.links.twitter && (
                        <motion.a
                          href={member.links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--background-secondary)' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Twitter size={20} style={{ color: 'var(--foreground)' }} />
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
