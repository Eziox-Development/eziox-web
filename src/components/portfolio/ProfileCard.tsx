import type { ComponentType } from 'react'
import { siteConfig } from '@/lib/site-config'
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
import { motion } from 'motion/react'
import { Sparkles, Verified } from 'lucide-react'

const iconMap: Record<string, ComponentType<{ size?: number }>> = {
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

export function ProfileCard() {
  const { owner } = siteConfig

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
      className="sticky top-28"
    >
      {/* Glow effect behind card */}
      <div
        className="absolute -inset-2 rounded-3xl opacity-50 blur-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        }}
      />

      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Header gradient with animated pattern */}
        <div
          className="h-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--accent))`,
          }}
        >
          {/* Animated floating particles */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 2px, transparent 2px),
                               radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 2px, transparent 2px),
                               radial-gradient(circle at 40% 80%, rgba(255,255,255,0.25) 1px, transparent 1px),
                               radial-gradient(circle at 60% 20%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: '80px 80px, 60px 60px, 40px 40px, 50px 50px',
            }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              width: '50%',
            }}
          />
        </div>

        {/* Avatar with glow ring */}
        <div className="px-6 -mt-14 relative z-10">
          <motion.div
            className="relative w-28 h-28 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              boxShadow:
                '0 0 0 4px var(--card), 0 0 30px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
            }}
          >
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover shine */}
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
              }}
            />
          </motion.div>

          {/* Online indicator */}
          <motion.div
            className="absolute bottom-1 right-5 w-5 h-5 rounded-full border-2"
            style={{
              backgroundColor: '#22c55e',
              borderColor: 'var(--card)',
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-5">
          {/* Name & Role */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold flex items-center gap-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {owner.name}
              <Verified
                size={20}
                fill="var(--primary)"
                style={{ color: 'var(--primary-foreground)' }}
              />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mt-1 font-medium"
              style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {owner.role}
            </motion.p>
          </div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm leading-relaxed"
            style={{
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {owner.bio}
          </motion.p>

          {/* Badges with gradient hover */}
          <div className="flex flex-wrap gap-2">
            {owner.badges.map((badge, index) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-default transition-all duration-200"
                style={{
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--foreground-muted)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {badge}
              </motion.span>
            ))}
          </div>

          {/* Gradient Divider */}
          <div
            className="h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--border), var(--primary), var(--border), transparent)',
            }}
          />

          {/* Social Links with glow */}
          <div className="flex flex-wrap gap-2">
            {owner.socialLinks.map((social, index) => {
              const Icon = iconMap[social.icon.toLowerCase()] || LuGlobe
              return (
                <motion.a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{
                    scale: 1.15,
                    y: -3,
                  }}
                  className="group relative p-2.5 rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground-muted)',
                  }}
                  aria-label={social.platform}
                  title={social.platform}
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"
                    style={{ background: 'var(--primary)' }}
                  />
                  <Icon size={18} />
                </motion.a>
              )
            })}
          </div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 pt-2"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            </motion.div>
            <span
              className="text-xs font-medium"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Available for new projects
            </span>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}
