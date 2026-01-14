import { Link } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'
import { motion } from 'motion/react'
import {
  LuTwitter,
  LuGithub,
  LuLinkedin,
  LuInstagram,
  LuDribbble,
  LuYoutube,
  LuMail,
  LuGlobe,
} from 'react-icons/lu'
import { FaDiscord } from 'react-icons/fa'
import {
  Heart,
  Sparkles,
  ArrowUpRight,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Shield,
  Zap,
  Globe,
  Mail,
  MapPin,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  twitter: LuTwitter,
  github: LuGithub,
  linkedin: LuLinkedin,
  instagram: LuInstagram,
  dribbble: LuDribbble,
  youtube: LuYoutube,
  mail: LuMail,
  globe: LuGlobe,
  discord: FaDiscord,
}

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Creators', href: '/creators' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Support', href: '/support' },
    { label: 'API', href: '/api' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}

const features = [
  { icon: LinkIcon, label: 'Bio Links' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Palette, label: 'Themes' },
  { icon: Shield, label: 'Secure' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
      {/* Top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent)',
        }}
      />

      {/* Background effects */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-5 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none opacity-5 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                style={{ boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)' }}
              >
                <img src="/icon.png" alt={siteConfig.metadata.title} className="w-full h-full object-cover" />
              </motion.div>
              <div>
                <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {siteConfig.metadata.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    BETA
                  </span>
                  <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Bio Link Platform
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
              Create your personalized bio link page and share everything you create with a single link.
              Free to start, powerful to grow.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <feature.icon size={12} />
                  {feature.label}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {siteConfig.owner.socialLinks.slice(0, 5).map((social) => {
                const Icon = iconMap[social.icon.toLowerCase()] || LuGlobe
                return (
                  <motion.a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground-muted)',
                    }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    aria-label={social.platform}
                  >
                    <Icon size={18} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-8">
            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Product
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:text-[var(--primary)]"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:text-[var(--primary)]"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:text-[var(--primary)]"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Column */}
          <div className="lg:col-span-3 space-y-6">
            <div
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  <Sparkles size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                    Get Started Free
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    No credit card required
                  </p>
                </div>
              </div>
              <Link
                to="/sign-up"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                }}
              >
                Create Your Page
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                <Mail size={14} style={{ color: 'var(--primary)' }} />
                <span>contact@eziox.link</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                <Globe size={14} style={{ color: 'var(--primary)' }} />
                <span>eziox.link</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                <MapPin size={14} style={{ color: 'var(--primary)' }} />
                <span>Worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="py-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <span>© {currentYear} {siteConfig.metadata.title}. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <Link to="/about" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/about" className="hover:text-[var(--primary)] transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart size={12} fill="var(--primary)" style={{ color: 'var(--primary)' }} />
            </motion.span>
            <span>by</span>
            <a
              href="https://github.com/XSaitoKungX"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-[var(--primary)] transition-colors"
            >
              Saito
            </a>
            <span className="flex items-center gap-1">
              <Zap size={12} style={{ color: 'var(--accent)' }} />
              Powered by React & TanStack
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
