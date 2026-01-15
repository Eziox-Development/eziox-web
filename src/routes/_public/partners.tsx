import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getCreatorsFn } from '@/server/functions/creators'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import {
  Handshake, Star, Loader2, Users2, TrendingUp, Activity,
  Eye, Heart, ArrowRight, Crown, ExternalLink, Sparkles, Shield,
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

  const { data: partnersData, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getCreators({ data: { featured: true, limit: 100 } }),
    refetchInterval: 30000,
  })

  const allPartners = partnersData?.creators || []
  const partners = allPartners.filter(c =>
    c.profile.badges?.includes('partner') || c.profile.isFeatured
  )

  const officialPartners = partners.filter(p => p.profile.badges?.includes('partner'))
  const featuredPartners = partners.filter(p => p.profile.isFeatured && !p.profile.badges?.includes('partner'))

  const stats = {
    total: partners.length,
    official: officialPartners.length,
    featured: featuredPartners.length,
    totalViews: partners.reduce((sum, p) => sum + (p.stats?.profileViews || 0), 0),
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(20, 184, 166, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.06)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Handshake size={28} className="text-white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                  animate={{ opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Partners</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Activity size={14} style={{ color: '#22c55e' }} />
                  <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Live · Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            <motion.a
              href="mailto:partners@eziox.link"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Handshake size={16} />
              Become a Partner
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Partners', value: stats.total, icon: Handshake, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
            { label: 'Official', value: stats.official, icon: Shield, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
            { label: 'Featured', value: stats.featured, icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            { label: 'Total Views', value: stats.totalViews, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
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
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 0%, ${stat.bg}, transparent 70%)` }}
              />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }} />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <motion.p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--foreground)' }}
                    key={stat.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.p>
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
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Become Our First Partner</h2>
            <p className="text-lg mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              We're looking for amazing creators and brands to partner with.
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
          <>
            {officialPartners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <Shield size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Official Partners</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officialPartners.map((partner, index) => (
                    <motion.div
                      key={partner.user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                    >
                      <Link
                        to="/$username"
                        params={{ username: partner.user.username }}
                        className="block rounded-2xl overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(20, 184, 166, 0.05))',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <div className="relative h-32">
                          {partner.profile.banner ? (
                            <img src={partner.profile.banner} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${partner.profile.accentColor || '#8b5cf6'}40, #14b8a620)` }} />
                          )}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.9)' }}>
                            <Shield size={12} className="text-white" />
                            <span className="text-xs font-semibold text-white">Official Partner</span>
                          </div>
                        </div>
                        <div className="p-4 -mt-10 relative">
                          <div className="flex items-end gap-3 mb-3">
                            <div
                              className="w-18 h-18 rounded-xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
                              style={{
                                width: '72px',
                                height: '72px',
                                background: partner.profile.avatar
                                  ? `url(${partner.profile.avatar}) center/cover`
                                  : `linear-gradient(135deg, ${partner.profile.accentColor || '#8b5cf6'}, #14b8a6)`,
                                boxShadow: '0 0 0 3px var(--background)',
                              }}
                            >
                              {!partner.profile.avatar && (partner.user.name ?? partner.user.username).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-lg truncate" style={{ color: 'var(--foreground)' }}>{partner.user.name || partner.user.username}</span>
                                {partner.profile.badges && partner.profile.badges.length > 0 && (
                                  <BadgeDisplay badges={partner.profile.badges} size="sm" maxDisplay={3} />
                                )}
                              </div>
                              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{partner.user.username}</p>
                            </div>
                          </div>
                          {partner.profile.bio && (
                            <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--foreground-muted)' }}>{partner.profile.bio}</p>
                          )}
                          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Eye size={14} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.profileViews?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Heart size={14} style={{ color: 'var(--foreground-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.followers?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: '#8b5cf6' }}>
                              <span>View</span>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {featuredPartners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                    <Star size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Featured Partners</h2>
                </div>
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="divide-y divide-white/5">
                    {featuredPartners.map((partner, index) => (
                      <motion.div
                        key={partner.user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.03 }}
                      >
                        <Link
                          to="/$username"
                          params={{ username: partner.user.username }}
                          className="flex items-center gap-4 p-5 transition-all hover:bg-white/5 group"
                        >
                          <div className="relative">
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                              style={{
                                background: partner.profile.avatar
                                  ? `url(${partner.profile.avatar}) center/cover`
                                  : `linear-gradient(135deg, ${partner.profile.accentColor || '#14b8a6'}, #8b5cf6)`,
                              }}
                            >
                              {!partner.profile.avatar && (partner.user.name ?? partner.user.username).charAt(0).toUpperCase()}
                            </div>
                            {partner.user.role === 'owner' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#fbbf24', border: '2px solid var(--background)' }}>
                                <Crown size={10} className="text-black" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                                {partner.user.name || partner.user.username}
                              </span>
                              {partner.profile.badges && partner.profile.badges.length > 0 && (
                                <BadgeDisplay badges={partner.profile.badges} size="sm" maxDisplay={3} />
                              )}
                            </div>
                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>@{partner.user.username}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Eye size={14} style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.profileViews?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Heart size={14} style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partner.stats?.followers?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ x: 2 }}
                          >
                            <ArrowRight size={18} style={{ color: 'var(--foreground-muted)' }} />
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div
            className="p-8 rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(139, 92, 246, 0.08))',
              border: '1px solid rgba(20, 184, 166, 0.15)',
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
              <Sparkles size={32} style={{ color: '#14b8a6' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Interested in Partnering?</h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              We're always looking for amazing creators and brands to collaborate with. Get exclusive benefits and grow together.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <motion.a
                href="mailto:partners@eziox.link"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink size={16} />
                Get in Touch
              </motion.a>
              <Link
                to="/creators"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
              >
                <Users2 size={16} />
                Browse Creators
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
