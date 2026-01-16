import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPartnersFn, getMyApplicationFn, getPartnerStatsFn } from '@/server/functions/partners'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import { PartnerApplicationForm } from '@/components/partner/PartnerApplicationForm'
import { useAuth } from '@/hooks/use-auth'
import {
  Handshake, Star, Loader2, Users2, TrendingUp,
  Eye, Heart, ArrowRight, Crown, Sparkles, Shield, CheckCircle2,
  Clock, XCircle, Award, Gift, Megaphone, Users, ChevronRight,
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

const PARTNER_BENEFITS = [
  { icon: Award, title: 'Partner Badge', description: 'Exclusive partner badge on your profile' },
  { icon: Megaphone, title: 'Featured Placement', description: 'Get featured on our homepage and partner page' },
  { icon: Gift, title: 'Premium Features', description: 'Access to premium features for free' },
  { icon: Users, title: 'Community Access', description: 'Join our exclusive partner community' },
]

function PartnersPage() {
  const { currentUser } = useAuth()
  const getPartners = useServerFn(getPartnersFn)
  const getMyApplication = useServerFn(getMyApplicationFn)
  const getStats = useServerFn(getPartnerStatsFn)

  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const { data: partnersData, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getPartners(),
    refetchInterval: 30000,
  })

  const { data: myApplication, refetch: refetchMyApplication } = useQuery({
    queryKey: ['my-partner-application'],
    queryFn: () => getMyApplication(),
    enabled: !!currentUser,
  })

  const { data: statsData } = useQuery({
    queryKey: ['partner-stats'],
    queryFn: () => getStats(),
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: '#f59e0b', label: 'Pending Review' }
      case 'reviewing':
        return { icon: Eye, color: '#3b82f6', label: 'Under Review' }
      case 'approved':
        return { icon: CheckCircle2, color: '#10b981', label: 'Approved' }
      case 'rejected':
        return { icon: XCircle, color: '#ef4444', label: 'Rejected' }
      default:
        return { icon: Clock, color: '#6b7280', label: status }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <Handshake size={16} style={{ color: '#14b8a6' }} />
              <span className="text-sm font-medium" style={{ color: '#14b8a6' }}>Partner Program</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Join Our{' '}
              <span style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Partner Network
              </span>
            </h1>

            <p className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
              Collaborate with us and unlock exclusive benefits. Whether you're a streamer, developer, gamer, or creator - we want to work with you.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {currentUser ? (
                myApplication ? (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {(() => {
                      const status = getStatusBadge(myApplication.status)
                      return (
                        <>
                          <status.icon size={20} style={{ color: status.color }} />
                          <span style={{ color: 'var(--foreground)' }}>Application: <strong style={{ color: status.color }}>{status.label}</strong></span>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setShowApplicationForm(true)}
                    className="px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles size={20} />
                    Apply Now
                    <ArrowRight size={18} />
                  </motion.button>
                )
              ) : (
                <Link
                  to="/sign-in"
                  className="px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                >
                  Sign In to Apply
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {[
              { icon: Users2, label: 'Partners', value: statsData?.totalPartners || partnersData?.stats?.official || 0 },
              { icon: Star, label: 'Featured', value: partnersData?.stats?.featured || 0 },
              { icon: Eye, label: 'Total Views', value: statsData?.totalPartnerViews || partnersData?.stats?.totalViews || 0 },
              { icon: TrendingUp, label: 'Pending', value: statsData?.pendingApplications || 0 },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <stat.icon size={24} className="mx-auto mb-2" style={{ color: '#14b8a6' }} />
                <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {typeof stat.value === 'number' && stat.value > 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}>
                <Gift size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Partner Benefits</h2>
                <p style={{ color: 'var(--foreground-muted)' }}>Exclusive perks for our partners</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNER_BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl group hover:scale-[1.02] transition-all"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)' 
                }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(139, 92, 246, 0.2))' }}>
                  <benefit.icon size={24} style={{ color: '#14b8a6' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{benefit.title}</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Official Partners */}
          {partnersData?.officialPartners && partnersData.officialPartners.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative" 
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Shield size={24} className="text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Official Partners</h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partnersData.officialPartners.length} verified partner badge holders</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnersData.officialPartners.map((partner, i) => (
                  <motion.div
                    key={partner.user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: partner.user.username }}
                      className="block group"
                    >
                      <motion.div
                        className="p-5 rounded-3xl transition-all"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)' 
                        }}
                        whileHover={{ y: -8, scale: 1.02 }}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <img
                              src={partner.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.user.username}`}
                              alt={partner.user.name || partner.user.username}
                              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
                            />
                            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}>
                              <Handshake size={12} className="text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg truncate" style={{ color: 'var(--foreground)' }}>{partner.user.name}</h3>
                              {partner.user.role === 'owner' && <Crown size={16} style={{ color: '#f59e0b' }} />}
                            </div>
                            <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>@{partner.user.username}</p>
                          </div>
                        </div>
                        
                        {partner.profile?.badges && partner.profile.badges.length > 0 && (
                          <div className="mb-3">
                            <BadgeDisplay badges={partner.profile.badges as string[]} maxDisplay={4} size="sm" />
                          </div>
                        )}
                        
                        {partner.profile?.bio && (
                          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{partner.profile.bio}</p>
                        )}
                        
                        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                            <span className="flex items-center gap-1.5">
                              <Eye size={14} />
                              {partner.stats?.profileViews || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Heart size={14} />
                              {partner.stats?.followers || 0}
                            </span>
                          </div>
                          <motion.div
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: '#14b8a6' }}
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            View
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Featured Creators */}
          {partnersData?.featuredPartners && partnersData.featuredPartners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative" 
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
                  whileHover={{ scale: 1.05, rotate: -5 }}
                >
                  <Star size={24} className="text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Featured Creators</h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{partnersData.featuredPartners.length} highlighted community members</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {partnersData.featuredPartners.map((partner, i) => (
                  <motion.div
                    key={partner.user.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: partner.user.username }}
                      className="block group"
                    >
                      <motion.div
                        className="p-4 rounded-2xl transition-all text-center"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)' 
                        }}
                        whileHover={{ y: -5, scale: 1.05 }}
                      >
                        <div className="relative inline-block mb-3">
                          <img
                            src={partner.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.user.username}`}
                            alt={partner.user.name || partner.user.username}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10 mx-auto"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
                            <Star size={10} className="text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{partner.user.name}</h3>
                        <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>@{partner.user.username}</p>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: '#14b8a6' }} />
            </div>
          ) : (!partnersData?.partners || partnersData.partners.length === 0) && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Handshake size={40} style={{ color: 'var(--foreground-muted)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No Partners Yet</h3>
              <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>Be the first to join our partner program!</p>
              {currentUser && !myApplication && (
                <motion.button
                  onClick={() => setShowApplicationForm(true)}
                  className="px-6 py-3 rounded-xl font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply Now
                </motion.button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && (
          <PartnerApplicationForm
            onClose={() => setShowApplicationForm(false)}
            onSuccess={() => {
              setShowApplicationForm(false)
              void refetchMyApplication()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
