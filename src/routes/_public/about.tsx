import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  Info,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Zap,
  Shield,
  Users,
  Globe,
  Heart,
  ArrowRight,
  Github,
  Mail,
  Sparkles,
  Crown,
} from 'lucide-react'

export const Route = createFileRoute('/_public/about')({
  component: AboutPage,
})

function AboutPage() {
  const features = [
    {
      icon: LinkIcon,
      title: 'Bio Links',
      description: 'Create a personalized page with all your important links in one place.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track views, clicks, and engagement with real-time analytics.',
    },
    {
      icon: Palette,
      title: 'Customization',
      description: 'Personalize your page with custom themes, colors, and layouts.',
    },
    {
      icon: Zap,
      title: 'URL Shortener',
      description: 'Create short, memorable links for any URL with click tracking.',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is protected with industry-standard security practices.',
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain for a professional branded experience.',
    },
  ]

  const stats = [
    { value: '100%', label: 'Free to Start' },
    { value: '∞', label: 'Unlimited Links' },
    { value: '24/7', label: 'Always Online' },
    { value: '<1s', label: 'Load Time' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 space-y-20"
    >
      {/* Background decorations */}
      <div
        className="absolute top-20 left-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute top-1/3 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Info size={18} style={{ color: 'white' }} />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            About Eziox
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
          style={{
            background: 'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Bio, Your Way
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
          style={{ color: 'var(--foreground-muted)' }}
        >
          Eziox is a modern bio link platform that helps you share everything you create,
          curate, and sell from your social media profiles. One link to rule them all.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Sparkles size={18} />
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <Users size={18} />
            View Creators
          </Link>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="p-6 rounded-2xl text-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="text-3xl sm:text-4xl font-black mb-2"
              style={{ color: 'var(--primary)' }}
            >
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Everything You Need
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Powerful features to help you stand out and grow your audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
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
      </motion.section>

      {/* Premium Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative p-8 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Crown size={36} style={{ color: 'white' }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Premium Features Coming Soon
            </h3>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Custom domains, advanced analytics, priority support, and full page customization.
              Premium users will have complete control over their bio page design.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Tech Stack Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Built with Modern Tech
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Eziox is built with cutting-edge technologies for speed and reliability.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['React', 'TypeScript', 'TailwindCSS', 'TanStack', 'Neon PostgreSQL', 'Drizzle ORM', 'Cloudinary', 'Vercel'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative text-center space-y-8 py-16 px-8 rounded-3xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at center, var(--primary), transparent 70%)',
          }}
        />

        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Heart size={28} style={{ color: 'white' }} />
        </motion.div>

        <h2
          className="relative text-3xl sm:text-4xl font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Questions or Feedback?
        </h2>
        <p
          className="relative text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--foreground-muted)' }}
        >
          We'd love to hear from you! Reach out with questions, suggestions, or just to say hi.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="mailto:contact@eziox.link"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Mail size={18} />
            Contact Us
          </a>
          <a
            href="https://github.com/XSaitoKungX/portfolio-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </motion.section>
    </motion.div>
  )
}
