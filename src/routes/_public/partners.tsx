import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn } from '@/server/functions/creators'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import {
  Handshake, Star, ExternalLink, Eye, Heart, ArrowRight, Loader2, Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/_public/partners')({
  head: () => ({
    meta: [
      { title: 'Partners | Eziox' },
      { name: 'description', content: 'Official Eziox partners and collaborators' },
    ],
  }),
  component: PartnersPage,
})

function PartnersPage() {
  const getCreators = useServerFn(getCreatorsFn)

  const { data: partnersData, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getCreators({ data: { featured: true, limit: 50 } }),
  })

  const partners = partnersData?.creators.filter(c => 
    c.profile.badges?.includes('partner') || c.profile.isFeatured
  ) || []

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(20, 184, 166, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.06)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Handshake size={16} style={{ color: '#14b8a6' }} />
            <span className="text-sm font-medium" style={{ color: '#14b8a6' }}>Official Partners</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Our <span style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Partners</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Meet our official partners and collaborators who help make Eziox amazing
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Total Partners', value: partners.length, icon: Handshake, color: '#14b8a6' },
            { label: 'Featured', value: partners.filter(p => p.profile.isFeatured).length, icon: Star, color: '#f59e0b' },
            { label: 'With Badge', value: partners.filter(p => p.profile.badges?.includes('partner')).length, icon: Sparkles, color: '#8b5cf6' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative p-5 rounded-2xl overflow-hidden group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }} />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="py-20 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 className="w-10 h-10 mx-auto" style={{ color: 'var(--primary)' }} />
            </motion.div>
            <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>Loading partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(20, 184, 166, 0.1)' }}
            >
              <Handshake size={48} style={{ color: '#14b8a6', opacity: 0.5 }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Become a Partner</h2>
            <p className="text-lg mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              We're looking for amazing creators and brands to partner with. Interested?
            </p>
            <motion.a
              href="mailto:partners@eziox.link"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Handshake size={18} />
              Contact Us
            </motion.a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to="/$username"
                  params={{ username: partner.user.username }}
                  className="block rounded-3xl overflow-hidden group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="relative h-36">
                    {partner.profile.banner ? (
                      <img src={partner.profile.banner} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${partner.profile.accentColor || '#14b8a6'}40, ${partner.profile.accentColor || '#8b5cf6'}20)` }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background: 'rgba(20, 184, 166, 0.9)' }}>
                      <Handshake size={14} className="text-white" />
                      <span className="text-xs font-semibold text-white">Partner</span>
                    </div>
                    {partner.profile.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#f59e0b' }}>
                          <Star size={14} className="text-black" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 -mt-10 relative">
                    <div className="flex items-end gap-4 mb-4">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
                        style={{
                          background: partner.profile.avatar
                            ? `url(${partner.profile.avatar}) center/cover`
                            : `linear-gradient(135deg, ${partner.profile.accentColor || '#14b8a6'}, #8b5cf6)`,
                          boxShadow: '0 0 0 4px var(--background)',
                        }}
                      >
                        {!partner.profile.avatar && (partner.user.name ?? partner.user.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold truncate" style={{ color: 'var(--foreground)' }}>{partner.user.name || partner.user.username}</span>
                          {partner.profile.badges && partner.profile.badges.length > 0 && (
                            <BadgeDisplay badges={partner.profile.badges} size="sm" maxDisplay={3} />
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{partner.user.username}</p>
                      </div>
                    </div>
                    {partner.profile.bio && (
                      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--foreground-muted)' }}>{partner.profile.bio}</p>
                    )}
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} style={{ color: 'var(--foreground-muted)' }} />
                          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.profileViews || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart size={14} style={{ color: 'var(--foreground-muted)' }} />
                          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.followers || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: '#14b8a6' }}>
                        <span>View Profile</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-block p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
          >
            <Handshake size={40} className="mx-auto mb-4" style={{ color: '#14b8a6' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Interested in Partnering?</h3>
            <p className="text-sm mb-4 max-w-md" style={{ color: 'var(--foreground-muted)' }}>
              We're always looking for amazing creators and brands to collaborate with.
            </p>
            <motion.a
              href="mailto:partners@eziox.link"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={16} />
              Get in Touch
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
