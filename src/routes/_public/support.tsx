import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { createTicketFn, TICKET_CATEGORIES } from '@/server/functions/tickets'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Send,
  Mail,
  MessageSquare,
  User,
  HelpCircle,
  Bug,
  CreditCard,
  Shield,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
  Globe,
  ChevronRight,
  ExternalLink,
  Ticket,
  Home,
} from 'lucide-react'
import { SiDiscord, SiGithub } from 'react-icons/si'

export const Route = createFileRoute('/_public/support')({
  head: () => ({
    meta: [
      { title: 'Support | Eziox' },
      {
        name: 'description',
        content:
          'Get help from the Eziox support team. Submit a ticket for technical issues, billing questions, account help, and more.',
      },
    ],
  }),
  component: SupportPage,
})

type CategoryId = (typeof TICKET_CATEGORIES)[number]

interface Category {
  id: CategoryId
  label: string
  description: string
  icon: React.ElementType
  color: string
  responseTime: string
  examples: string[]
}

function SupportPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const createTicket = useServerFn(createTicketFn)

  const [step, setStep] = useState<'category' | 'form' | 'success'>('category')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    guestName: '',
    guestEmail: '',
  })
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)

  const cardRadius = useMemo(
    () =>
      theme.effects.borderRadius === 'pill'
        ? '24px'
        : theme.effects.borderRadius === 'sharp'
          ? '8px'
          : '16px',
    [theme.effects.borderRadius],
  )

  const glowOpacity = useMemo(
    () =>
      theme.effects.glowIntensity === 'strong'
        ? 0.4
        : theme.effects.glowIntensity === 'medium'
          ? 0.25
          : theme.effects.glowIntensity === 'subtle'
            ? 0.15
            : 0,
    [theme.effects.glowIntensity],
  )

  const categories: Category[] = useMemo(
    () => [
      {
        id: 'general',
        label: t('support.categories.general.label', 'General Support'),
        description: t('support.categories.general.description', 'Questions, feedback, feature requests, partnerships'),
        icon: HelpCircle,
        color: '#6366f1',
        responseTime: '24-48h',
        examples: ['How does X work?', 'Feature request', 'Partnership inquiry'],
      },
      {
        id: 'technical',
        label: t('support.categories.technical.label', 'Technical Support'),
        description: t('support.categories.technical.description', 'Bugs, errors, and technical issues'),
        icon: Bug,
        color: '#ef4444',
        responseTime: '12-24h',
        examples: ['Page not loading', 'Feature not working', 'Error message'],
      },
      {
        id: 'billing',
        label: t('support.categories.billing.label', 'Billing & Payments'),
        description: t('support.categories.billing.description', 'Subscriptions, invoices, refunds, cancellations'),
        icon: CreditCard,
        color: '#22c55e',
        responseTime: '24-48h',
        examples: ['Payment failed', 'Cancel subscription', 'Request refund'],
      },
      {
        id: 'account',
        label: t('support.categories.account.label', 'Account & Security'),
        description: t('support.categories.account.description', 'Login, password, security, data privacy'),
        icon: Shield,
        color: '#8b5cf6',
        responseTime: '24-48h',
        examples: ["Can't login", 'Security concern', 'Delete my data'],
      },
      {
        id: 'abuse',
        label: t('support.categories.abuse.label', 'Report Abuse'),
        description: t('support.categories.abuse.description', 'Harmful content, copyright, legal issues'),
        icon: AlertTriangle,
        color: '#f59e0b',
        responseTime: '12-24h',
        examples: ['Spam profile', 'Copyright claim', 'Malicious links'],
      },
    ],
    [t],
  )

  const quickLinks = useMemo(
    () => [
      {
        icon: SiDiscord,
        label: 'Discord Community',
        href: 'https://discord.com/invite/KD84DmNA89',
        description: 'Get help from the community',
        color: '#5865F2',
      },
      {
        icon: SiGithub,
        label: 'GitHub Issues',
        href: 'https://github.com/Eziox-Development/eziox-web/issues',
        description: 'Report bugs & request features',
        color: '#ffffff',
      },
      {
        icon: Globe,
        label: 'Status Page',
        href: 'https://status.eziox.link',
        description: 'Check service status',
        color: '#22c55e',
      },
    ],
    [],
  )

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory) throw new Error('No category selected')
      return createTicket({
        data: {
          category: selectedCategory,
          subject: formData.subject,
          description: formData.description,
          guestEmail: currentUser ? undefined : formData.guestEmail,
          guestName: currentUser ? undefined : formData.guestName,
        },
      })
    },
    onSuccess: (result) => {
      setTicketNumber(result.ticketNumber)
      setStep('success')
      toast.success(t('support.success.toast', 'Ticket submitted successfully!'))
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit ticket')
    },
  })

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId)
    setStep('form')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || formData.subject.length < 5) {
      toast.error(t('support.validation.subjectRequired', 'Subject must be at least 5 characters'))
      return
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error(t('support.validation.descriptionRequired', 'Description must be at least 20 characters'))
      return
    }
    if (!currentUser && (!formData.guestEmail || !formData.guestName)) {
      toast.error(t('support.validation.guestInfoRequired', 'Please provide your name and email'))
      return
    }
    submitMutation.mutate()
  }

  const currentCategory = categories.find((c) => c.id === selectedCategory)

  // Success Screen
  if (step === 'success') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-24"
        style={{ background: theme.colors.background }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center p-10"
          style={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
            }}
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>

          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: theme.colors.foreground }}
          >
            {t('support.success.title', 'Ticket Submitted!')}
          </h1>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
            style={{
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <Ticket size={18} style={{ color: theme.colors.primary }} />
            <span
              className="font-mono font-bold"
              style={{ color: theme.colors.primary }}
            >
              {ticketNumber}
            </span>
          </div>

          <p className="mb-8" style={{ color: theme.colors.foregroundMuted }}>
            {t('support.success.description', "We've received your request and will respond as soon as possible. Check your email for updates.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 font-medium"
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  color: theme.colors.foreground,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home size={18} /> {t('support.success.backHome', 'Back to Home')}
              </motion.button>
            </Link>
            <motion.button
              onClick={() => {
                setStep('category')
                setSelectedCategory(null)
                setFormData({ subject: '', description: '', guestName: '', guestEmail: '' })
                setTicketNumber(null)
              }}
              className="flex items-center gap-2 px-6 py-3 font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send size={18} /> {t('support.success.newTicket', 'Submit Another')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{ background: theme.colors.primary, opacity: glowOpacity * 0.3 }}
        />
        <div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: theme.colors.accent, opacity: glowOpacity * 0.2 }}
        />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <MessageSquare size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
                {t('support.badge', 'Support Center')}
              </span>
            </motion.div>

            <h1
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: theme.colors.foreground }}
            >
              {t('support.hero.title', 'How can we')}{' '}
              <span
                style={{
                  color: theme.colors.primary,
                  textShadow: glowOpacity > 0 ? `0 0 40px ${theme.colors.primary}60` : undefined,
                }}
              >
                {t('support.hero.titleHighlight', 'help you')}
              </span>
              ?
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              {t('support.hero.subtitle', 'Select a category below to get started. Our team typically responds within 24-48 hours.')}
            </p>

            {/* My Tickets Link for logged in users */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <Link
                  to="/support/tickets"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.foreground,
                  }}
                >
                  <Ticket size={18} style={{ color: theme.colors.primary }} />
                  {t('support.viewMyTickets', 'View My Tickets')}
                  <ChevronRight size={16} style={{ color: theme.colors.foregroundMuted }} />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group p-4 flex items-center gap-4"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
                whileHover={{ y: -2 }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl"
                  style={{ background: `${link.color}15` }}
                >
                  <link.icon size={20} style={{ color: link.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: theme.colors.foreground }}>
                    {link.label}
                  </h3>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    {link.description}
                  </p>
                </div>
                <ExternalLink size={16} style={{ color: theme.colors.foregroundMuted }} />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2
                  className="text-xl font-bold mb-6 flex items-center gap-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <FileText size={20} style={{ color: theme.colors.primary }} />
                  {t('support.selectCategory', 'Select a Category')}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="group p-5 text-left transition-all"
                      style={{
                        background: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: cardRadius,
                      }}
                      whileHover={{
                        y: -4,
                        borderColor: cat.color,
                        boxShadow: `0 8px 30px ${cat.color}20`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl transition-colors"
                          style={{ background: `${cat.color}15` }}
                        >
                          <cat.icon size={24} style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
                              {cat.label}
                            </h3>
                            <ChevronRight
                              size={16}
                              style={{ color: theme.colors.foregroundMuted }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          <p className="text-sm mb-2" style={{ color: theme.colors.foregroundMuted }}>
                            {cat.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock size={12} style={{ color: theme.colors.foregroundMuted }} />
                            <span
                              className="text-xs"
                              style={{
                                color: cat.responseTime === 'Priority' ? '#ef4444' : theme.colors.foregroundMuted,
                              }}
                            >
                              {cat.responseTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'form' && currentCategory && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Back Button */}
                <button
                  onClick={() => setStep('category')}
                  className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <ArrowRight size={16} className="rotate-180" />
                  {t('support.backToCategories', 'Back to categories')}
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Category Info */}
                  <div
                    className="lg:col-span-1 p-6 h-fit lg:sticky lg:top-24"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: cardRadius,
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-14 h-14 flex items-center justify-center rounded-xl"
                        style={{ background: `${currentCategory.color}20` }}
                      >
                        <currentCategory.icon size={28} style={{ color: currentCategory.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: theme.colors.foreground }}>
                          {currentCategory.label}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} style={{ color: theme.colors.foregroundMuted }} />
                          <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                            Response: {currentCategory.responseTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>
                      {currentCategory.description}
                    </p>

                    <div
                      className="p-3 rounded-lg"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <p className="text-xs font-medium mb-2" style={{ color: theme.colors.foreground }}>
                        {t('support.examples', 'Example topics:')}
                      </p>
                      <ul className="space-y-1">
                        {currentCategory.examples.map((ex) => (
                          <li
                            key={ex}
                            className="text-xs flex items-center gap-2"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <span style={{ color: currentCategory.color }}>•</span>
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-2 p-6"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: cardRadius,
                    }}
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.foreground }}>
                      {t('support.form.title', 'Submit Your Request')}
                    </h2>

                    <div className="space-y-5">
                      {/* Guest Info (only if not logged in) */}
                      {!currentUser && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label
                              className="flex items-center gap-2 text-sm font-medium mb-2"
                              style={{ color: theme.colors.foreground }}
                            >
                              <User size={14} style={{ color: theme.colors.primary }} />
                              {t('support.form.name', 'Your Name')} *
                            </label>
                            <input
                              type="text"
                              value={formData.guestName}
                              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                              placeholder={t('support.form.namePlaceholder', 'John Doe')}
                              className="w-full px-4 py-3 outline-none transition-all"
                              style={{
                                background: theme.colors.backgroundSecondary,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: cardRadius,
                                color: theme.colors.foreground,
                              }}
                            />
                          </div>
                          <div>
                            <label
                              className="flex items-center gap-2 text-sm font-medium mb-2"
                              style={{ color: theme.colors.foreground }}
                            >
                              <Mail size={14} style={{ color: theme.colors.primary }} />
                              {t('support.form.email', 'Your Email')} *
                            </label>
                            <input
                              type="email"
                              value={formData.guestEmail}
                              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                              placeholder={t('support.form.emailPlaceholder', 'you@example.com')}
                              className="w-full px-4 py-3 outline-none transition-all"
                              style={{
                                background: theme.colors.backgroundSecondary,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: cardRadius,
                                color: theme.colors.foreground,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Logged in user info */}
                      {currentUser && (
                        <div
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            background: `${theme.colors.primary}10`,
                            border: `1px solid ${theme.colors.primary}20`,
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: theme.colors.primary }}
                          >
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>
                              {currentUser.username || currentUser.email}
                            </p>
                            <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                              {t('support.form.loggedInAs', 'Submitting as logged in user')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Subject */}
                      <div>
                        <label
                          className="flex items-center gap-2 text-sm font-medium mb-2"
                          style={{ color: theme.colors.foreground }}
                        >
                          <MessageSquare size={14} style={{ color: theme.colors.primary }} />
                          {t('support.form.subject', 'Subject')} *
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={t('support.form.subjectPlaceholder', 'Brief summary of your issue')}
                          maxLength={255}
                          className="w-full px-4 py-3 outline-none transition-all"
                          style={{
                            background: theme.colors.backgroundSecondary,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: cardRadius,
                            color: theme.colors.foreground,
                          }}
                        />
                        <p className="text-xs mt-1 text-right" style={{ color: theme.colors.foregroundMuted }}>
                          {formData.subject.length}/255
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          className="flex items-center gap-2 text-sm font-medium mb-2"
                          style={{ color: theme.colors.foreground }}
                        >
                          <FileText size={14} style={{ color: theme.colors.primary }} />
                          {t('support.form.description', 'Description')} *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder={t('support.form.descriptionPlaceholder', 'Please describe your issue in detail. Include any relevant information like error messages, steps to reproduce, etc.')}
                          rows={8}
                          maxLength={5000}
                          className="w-full px-4 py-3 outline-none transition-all resize-none"
                          style={{
                            background: theme.colors.backgroundSecondary,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: cardRadius,
                            color: theme.colors.foreground,
                          }}
                        />
                        <p className="text-xs mt-1 text-right" style={{ color: theme.colors.foregroundMuted }}>
                          {formData.description.length}/5000
                        </p>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white disabled:opacity-50"
                        style={{
                          background: `linear-gradient(135deg, ${currentCategory.color}, ${theme.colors.accent})`,
                          borderRadius: cardRadius,
                          boxShadow: glowOpacity > 0 ? `0 15px 40px ${currentCategory.color}40` : undefined,
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t('support.form.submitting', 'Submitting...')}
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            {t('support.form.submit', 'Submit Ticket')}
                          </>
                        )}
                      </motion.button>

                      {/* Privacy Note */}
                      <p className="text-xs text-center" style={{ color: theme.colors.foregroundMuted }}>
                        {t('support.form.privacyNote', 'By submitting, you agree to our')}{' '}
                        <Link to="/privacy" className="underline" style={{ color: theme.colors.primary }}>
                          {t('support.form.privacyLink', 'Privacy Policy')}
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
