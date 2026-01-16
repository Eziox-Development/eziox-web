import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getPartnersFn, getMyApplicationFn, submitPartnerApplicationFn, getPartnerStatsFn } from '@/server/functions/partners'
import { BadgeDisplay } from '@/components/ui/BadgeDisplay'
import { useAuth } from '@/hooks/use-auth'
import {
  Handshake, Star, Loader2, Users2, TrendingUp, Activity,
  Eye, Heart, ArrowRight, Crown, Sparkles, Shield, CheckCircle2,
  Clock, XCircle, Send, Building2, Globe, MessageSquare, Zap,
  Award, Gift, Megaphone, Users, ChevronRight, FileText,
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

const PARTNER_CATEGORIES = [
  { id: 'creator', label: 'Creator', icon: Sparkles },
  { id: 'brand', label: 'Brand', icon: Building2 },
  { id: 'agency', label: 'Agency', icon: Users },
  { id: 'developer', label: 'Developer', icon: Zap },
  { id: 'other', label: 'Other', icon: MessageSquare },
] as const

const AUDIENCE_SIZES = [
  { id: 'small', label: '< 1K followers' },
  { id: 'medium', label: '1K - 10K followers' },
  { id: 'large', label: '10K - 100K followers' },
  { id: 'enterprise', label: '100K+ followers' },
] as const

const PARTNER_BENEFITS = [
  { icon: Award, title: 'Partner Badge', description: 'Exclusive partner badge on your profile' },
  { icon: Megaphone, title: 'Featured Placement', description: 'Get featured on our homepage and partner page' },
  { icon: Gift, title: 'Premium Features', description: 'Access to premium features for free' },
  { icon: Users, title: 'Community Access', description: 'Join our exclusive partner community' },
]

function PartnersPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getPartners = useServerFn(getPartnersFn)
  const getMyApplication = useServerFn(getMyApplicationFn)
  const submitApplication = useServerFn(submitPartnerApplicationFn)
  const getStats = useServerFn(getPartnerStatsFn)

  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    category: '' as typeof PARTNER_CATEGORIES[number]['id'] | '',
    audienceSize: '' as typeof AUDIENCE_SIZES[number]['id'] | '',
    description: '',
    whyPartner: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const { data: partnersData, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getPartners(),
    refetchInterval: 30000,
  })

  const { data: myApplication } = useQuery({
    queryKey: ['my-partner-application'],
    queryFn: () => getMyApplication(),
    enabled: !!currentUser,
  })

  const { data: statsData } = useQuery({
    queryKey: ['partner-stats'],
    queryFn: () => getStats(),
    refetchInterval: 30000,
  })

  const submitMutation = useMutation({
    mutationFn: (data: Parameters<typeof submitApplication>[0]) => submitApplication(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-partner-application'] })
      setShowApplicationForm(false)
      setFormData({ companyName: '', website: '', category: '', audienceSize: '', description: '', whyPartner: '' })
    },
    onError: (error: Error) => {
      setFormError(error.message)
    },
  })

  const partners = partnersData?.partners || []
  const officialPartners = partnersData?.officialPartners || []
  const featuredPartners = partnersData?.featuredPartners || []

  const stats = {
    total: statsData?.totalPartners || partners.length,
    official: officialPartners.length,
    featured: featuredPartners.length,
    totalViews: statsData?.totalPartnerViews || partners.reduce((sum, p) => sum + (p.stats?.profileViews || 0), 0),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.category) {
      setFormError('Please select a category')
      return
    }
    if (formData.description.length < 50) {
      setFormError('Description must be at least 50 characters')
      return
    }
    if (formData.whyPartner.length < 50) {
      setFormError('Please explain why you want to partner (at least 50 characters)')
      return
    }

    submitMutation.mutate({
      data: {
        companyName: formData.companyName || undefined,
        website: formData.website || undefined,
        category: formData.category as 'creator' | 'brand' | 'agency' | 'developer' | 'other',
        audienceSize: formData.audienceSize as 'small' | 'medium' | 'large' | 'enterprise' | undefined,
        description: formData.description,
        whyPartner: formData.whyPartner,
      },
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending Review' }
      case 'reviewing':
        return { icon: Eye, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Under Review' }
      case 'approved':
        return { icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', label: 'Approved' }
      case 'rejected':
        return { icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Rejected' }
      default:
        return { icon: Clock, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'Unknown' }
    }
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
            {currentUser && !myApplication && (
              <motion.button
                onClick={() => setShowApplicationForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Handshake size={16} />
                Apply for Partnership
              </motion.button>
            )}
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

        {myApplication && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                  <FileText size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Your Application</h2>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Submitted {new Date(myApplication.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto">
                  {(() => {
                    const config = getStatusConfig(myApplication.status)
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: config.bg }}>
                        <config.icon size={14} style={{ color: config.color }} />
                        <span className="text-sm font-medium" style={{ color: config.color }}>{config.label}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {myApplication.status === 'pending' && "We're reviewing your application. You'll be notified once we make a decision."}
                {myApplication.status === 'reviewing' && "Your application is being reviewed by our team. We'll get back to you soon."}
                {myApplication.status === 'approved' && "Congratulations! Your application has been approved. Welcome to the partner program!"}
                {myApplication.status === 'rejected' && "Unfortunately, your application wasn't approved this time. You can apply again in the future."}
              </p>
            </div>
          </motion.div>
        )}

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
            transition={{ delay: 0.2 }}
          >
            <div
              className="p-8 rounded-3xl text-center mb-8"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                <Handshake size={40} style={{ color: '#14b8a6', opacity: 0.5 }} />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Become Our First Partner</h2>
              <p className="text-lg mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                We're looking for amazing creators and brands to partner with.
              </p>
              {currentUser ? (
                <motion.button
                  onClick={() => setShowApplicationForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                  Apply Now
                </motion.button>
              ) : (
                <Link to="/sign-in">
                  <motion.button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In to Apply
                  </motion.button>
                </Link>
              )}
            </div>
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
                      whileHover={{ y: -4 }}
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
                        <div className="relative h-28">
                          {partner.profile.banner ? (
                            <img src={partner.profile.banner} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${partner.profile.accentColor || '#8b5cf6'}40, #14b8a620)` }} />
                          )}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.9)' }}>
                            <Shield size={12} className="text-white" />
                            <span className="text-xs font-semibold text-white">Partner</span>
                          </div>
                        </div>
                        <div className="p-4 -mt-8 relative">
                          <div className="flex items-end gap-3 mb-3">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                              style={{
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
                                <span className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{partner.user.name || partner.user.username}</span>
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
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                    <Star size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Featured Creators</h2>
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
                            <ChevronRight size={18} style={{ color: 'var(--foreground-muted)' }} />
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
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
              <Gift size={16} style={{ color: '#14b8a6' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Partner Benefits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNER_BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
                  <benefit.icon size={24} style={{ color: '#14b8a6' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>{benefit.title}</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Ready to Partner?</h3>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                Join our partner program and unlock exclusive benefits. Sign in to apply.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/sign-in">
                  <motion.button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In to Apply
                  </motion.button>
                </Link>
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
        )}
      </div>

      <AnimatePresence>
        {showApplicationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowApplicationForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}>
                  <Handshake size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Partner Application</h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Tell us about yourself</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Company/Brand Name <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Your company name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Website <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                    </label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PARTNER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: formData.category === cat.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${formData.category === cat.id ? '#14b8a6' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: formData.category === cat.id ? '#14b8a6' : 'var(--foreground-muted)',
                        }}
                      >
                        <cat.icon size={16} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Audience Size <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, audienceSize: size.id })}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: formData.audienceSize === size.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${formData.audienceSize === size.id ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: formData.audienceSize === size.id ? '#8b5cf6' : 'var(--foreground-muted)',
                        }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    About You/Your Brand <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about yourself, your content, and your audience..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    {formData.description.length}/2000 characters (min 50)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Why Partner With Us? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={formData.whyPartner}
                    onChange={(e) => setFormData({ ...formData, whyPartner: e.target.value })}
                    placeholder="What do you hope to achieve through this partnership?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    {formData.whyPartner.length}/2000 characters (min 50)
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p className="text-sm" style={{ color: '#ef4444' }}>{formError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white', opacity: submitMutation.isPending ? 0.7 : 1 }}
                    whileHover={{ scale: submitMutation.isPending ? 1 : 1.02 }}
                    whileTap={{ scale: submitMutation.isPending ? 1 : 0.98 }}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Application
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
