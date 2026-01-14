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
  LuRss,
} from 'react-icons/lu'
import { FaDiscord } from 'react-icons/fa'
import { Heart, Sparkles, ArrowUpRight, ChevronRight } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  twitter: LuTwitter,
  github: LuGithub,
  linkedin: LuLinkedin,
  instagram: LuInstagram,
  dribbble: LuDribbble,
  youtube: LuYoutube,
  mail: LuMail,
  rss: LuRss,
  globe: LuGlobe,
  discord: FaDiscord,
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="relative mt-auto overflow-hidden"
      style={{
        backgroundColor: 'var(--background-secondary)',
      }}
    >
      {/* Top decorative border with gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent)',
        }}
      />

      {/* Background glow effects */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-4 group">
              <motion.div
                className="relative w-14 h-14 rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  boxShadow:
                    '0 0 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                }}
              >
                <img
                  src="/saito.png"
                  alt={siteConfig.owner.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Shine effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                  }}
                />
              </motion.div>
              <div>
                <span
                  className="text-xl font-bold block"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {siteConfig.metadata.title}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Creative Developer
                </span>
              </div>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {siteConfig.metadata.description}
            </p>

            {/* Social Links with glow */}
            <div className="flex flex-wrap gap-3 pt-2">
              {siteConfig.owner.socialLinks.map((social, index) => {
                const Icon = iconMap[social.icon.toLowerCase()] || LuGlobe
                return (
                  <motion.a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground-muted)',
                    }}
                    whileHover={{
                      scale: 1.1,
                      y: -3,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    aria-label={social.platform}
                    title={social.platform}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"
                      style={{ background: 'var(--primary)' }}
                    />
                    <Icon size={20} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-5">
            <h3
              className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              Quick Links
            </h3>
            <nav className="flex flex-col gap-3">
              {siteConfig.footerLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className="group inline-flex items-center gap-2 text-sm transition-all duration-200"
                    style={{
                      color: 'var(--foreground-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <ChevronRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      style={{ color: 'var(--primary)' }}
                    />
                    <span className="group-hover:text-[var(--primary)] transition-colors duration-200">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* Newsletter / RSS Section */}
          <div className="md:col-span-4 space-y-5">
            <h3
              className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              Stay Updated
            </h3>
            <p
              className="text-sm"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Subscribe to get the latest posts and updates directly in your
              feed reader.
            </p>

            <motion.a
              href="/rss"
              className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-body)',
                boxShadow:
                  '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LuRss size={18} />
              Subscribe via RSS
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </motion.a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p
            className="text-sm flex items-center gap-1"
            style={{
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {siteConfig.metadata.copyright.replace(
              new Date().getFullYear().toString(),
              currentYear.toString(),
            )}{' '}
            {siteConfig.owner.name}
          </p>
          <p
            className="text-xs flex items-center gap-1.5"
            style={{
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Built with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart
                size={12}
                fill="var(--primary)"
                style={{ color: 'var(--primary)' }}
              />
            </motion.span>
            and
            <Sparkles size={12} style={{ color: 'var(--accent)' }} />
            creativity
          </p>
        </div>
      </div>
    </footer>
  )
}
