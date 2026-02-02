import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { submitContactFormFn } from '@/server/functions/contact'
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
  UserCog,
  Sparkles,
  Shield,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  Zap,
  Home,
  FileText,
} from 'lucide-react'
import { SiDiscord, SiGithub } from 'react-icons/si'

export const Route = createFileRoute('/_public/contact')({
  head: () => ({
    meta: [
      { title: 'Contact Us | Eziox' },
      {
        name: 'description',
        content:
          "Get in touch with the Eziox team. We're here to help with questions, feedback, partnerships, and support.",
      },
    ],
  }),
  component: ContactPage,
})

type CategoryId =
  | 'general'
  | 'support'
  | 'billing'
  | 'account'
  | 'feature'
  | 'security'

export function ContactPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const submitContact = useServerFn(submitContactFormFn)
  const [category, setCategory] = useState<CategoryId>('general')
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  const categories = useMemo(
    () => [
      {
        id: 'general' as const,
        label: t('contact.categories.general.label'),
        icon: HelpCircle,
        color: '#6366f1',
        description: t('contact.categories.general.description'),
        responseTime: t('contact.responseTime.24-48h'),
      },
      {
        id: 'support' as const,
        label: t('contact.categories.support.label'),
        icon: Bug,
        color: '#ef4444',
        description: t('contact.categories.support.description'),
        responseTime: t('contact.responseTime.12-24h'),
      },
      {
        id: 'billing' as const,
        label: t('contact.categories.billing.label'),
        icon: CreditCard,
        color: '#22c55e',
        description: t('contact.categories.billing.description'),
        responseTime: t('contact.responseTime.24-48h'),
      },
      {
        id: 'account' as const,
        label: t('contact.categories.account.label'),
        icon: UserCog,
        color: '#06b6d4',
        description: t('contact.categories.account.description'),
        responseTime: t('contact.responseTime.1-3d'),
      },
      {
        id: 'feature' as const,
        label: t('contact.categories.feature.label'),
        icon: Sparkles,
        color: '#f59e0b',
        description: t('contact.categories.feature.description'),
        responseTime: t('contact.responseTime.24-48h'),
      },
      {
        id: 'security' as const,
        label: t('contact.categories.security.label'),
        icon: Shield,
        color: '#8b5cf6',
        description: t('contact.categories.security.description'),
        responseTime: t('contact.responseTime.priority'),
      },
    ],
    [t],
  )

  const quickLinks = useMemo(
    () => [
      {
        icon: SiDiscord,
        label: t('contact.quickLinks.discord.title'),
        href: 'https://discord.com/invite/KD84DmNA89',
        description: t('contact.quickLinks.discord.description'),
        color: '#5865F2',
      },
      {
        icon: SiGithub,
        label: t('contact.quickLinks.github.title'),
        href: 'https://github.com/Eziox-Development/eziox-web/issues',
        description: t('contact.quickLinks.github.description'),
        color: '#ffffff',
      },
      {
        icon: Mail,
        label: t('contact.quickLinks.email.title'),
        href: 'mailto:contact@eziox.link',
        description: t('contact.quickLinks.email.description'),
        color: '#22c55e',
      },
    ],
    [t],
  )

  const faqItems = useMemo(
    () => [
      { q: t('contact.faq.q1'), a: t('contact.faq.a1'), icon: Clock },
      { q: t('contact.faq.q2'), a: t('contact.faq.a2'), icon: Shield },
      { q: t('contact.faq.q3'), a: t('contact.faq.a3'), icon: CreditCard },
      { q: t('contact.faq.q4'), a: t('contact.faq.a4'), icon: MessageSquare },
    ],
    [t],
  )

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name)
    if (currentUser?.email) setEmail(currentUser.email)
  }, [currentUser])

  const submitMutation = useMutation({
    mutationFn: () =>
      submitContact({
        data: { category, name, email, subject, message },
      }),
    onSuccess: () => {
      setSubmitted(true)
      toast.success(t('contact.success.title'))
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = t('contact.validation.nameRequired')
    if (!email.trim()) errors.email = t('contact.validation.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = t('contact.validation.emailInvalid')
    if (!subject.trim())
      errors.subject = t('contact.validation.subjectRequired')
    else if (subject.length < 5)
      errors.subject = t('contact.validation.subjectTooShort')
    if (!message.trim())
      errors.message = t('contact.validation.messageRequired')
    else if (message.length < 20)
      errors.message = t('contact.validation.messageTooShort')
    else if (message.length > 2000)
      errors.message = t('contact.validation.messageTooLong')

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [name, email, subject, message, t])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) {
        toast.error(t('contact.validation.fixErrors'))
        return
      }
      submitMutation.mutate()
    },
    [validateForm, submitMutation, t],
  )

  const selectedCategory = categories.find((c) => c.id === category)

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-24"
        style={{
          background: theme.colors.background,
          fontFamily: theme.typography.bodyFont,
        }}
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
              background:
                'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
            }}
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>

          <h1
            className="text-3xl font-bold mb-4"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {t('contact.success.title')}
          </h1>
          <p
            className="text-lg mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('contact.success.subtitle')}
          </p>
          <p className="mb-8" style={{ color: theme.colors.foregroundMuted }}>
            {t('contact.success.responseTime')}{' '}
            <strong style={{ color: theme.colors.foreground }}>
              {selectedCategory?.responseTime ||
                t('contact.responseTime.24-48h')}
            </strong>
            .
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
                <Home size={18} /> {t('contact.success.backHome')}
              </motion.button>
            </Link>
            <motion.button
              onClick={() => {
                setSubmitted(false)
                setSubject('')
                setMessage('')
              }}
              className="flex items-center gap-2 px-6 py-3 font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send size={18} /> {t('contact.success.sendAnother')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
        />
        <div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <MessageSquare
                size={16}
                style={{ color: theme.colors.primary }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('contact.badge')}
              </span>
            </motion.div>

            <h1
              className="text-4xl lg:text-6xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('contact.hero.title')}{' '}
              <span
                style={{
                  color: theme.colors.primary,
                  textShadow:
                    glowOpacity > 0
                      ? `0 0 40px ${theme.colors.primary}60`
                      : undefined,
                }}
              >
                {t('contact.hero.titleHighlight')}
              </span>
              ?
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('contact.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-4">
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
                className="group p-5 flex items-center gap-4"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl"
                  style={{ background: `${link.color}15` }}
                >
                  <link.icon size={24} style={{ color: link.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-0.5"
                    style={{ color: theme.colors.foreground }}
                  >
                    {link.label}
                  </h3>
                  <p
                    className="text-sm truncate"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {link.description}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  style={{ color: theme.colors.foregroundMuted }}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Category Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div
                className="sticky top-24 p-6"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <h2
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.displayFont,
                  }}
                >
                  <FileText size={20} style={{ color: theme.colors.primary }} />
                  {t('contact.categories.title')}
                </h2>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className="w-full p-4 flex items-center gap-4 text-left transition-all"
                      style={{
                        background:
                          category === cat.id
                            ? `${cat.color}15`
                            : 'transparent',
                        border: `1px solid ${category === cat.id ? cat.color : theme.colors.border}`,
                        borderRadius: cardRadius,
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl"
                        style={{ background: `${cat.color}20` }}
                      >
                        <cat.icon size={20} style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium"
                          style={{ color: theme.colors.foreground }}
                        >
                          {cat.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {cat.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {category === cat.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 flex items-center justify-center rounded-full"
                            style={{ background: cat.color }}
                          >
                            <CheckCircle2 size={12} className="text-white" />
                          </motion.div>
                        )}
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded"
                          style={{
                            background:
                              cat.id === 'security'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : theme.colors.backgroundSecondary,
                            color:
                              cat.id === 'security'
                                ? '#ef4444'
                                : theme.colors.foregroundMuted,
                          }}
                        >
                          {cat.responseTime}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Tips */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{ background: theme.colors.backgroundSecondary }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} style={{ color: theme.colors.primary }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t('contact.tips.title')}
                    </span>
                  </div>
                  <ul
                    className="space-y-2 text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      {t('contact.tips.tip1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      {t('contact.tips.tip2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      {t('contact.tips.tip3')}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <form
                onSubmit={handleSubmit}
                className="p-6 lg:p-8"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                {/* Form Header */}
                <div
                  className="flex items-center gap-4 mb-6 pb-6"
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  {selectedCategory && (
                    <>
                      <div
                        className="w-12 h-12 flex items-center justify-center rounded-xl"
                        style={{ background: `${selectedCategory.color}20` }}
                      >
                        <selectedCategory.icon
                          size={24}
                          style={{ color: selectedCategory.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-bold text-lg"
                          style={{ color: theme.colors.foreground }}
                        >
                          {selectedCategory.label}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {selectedCategory.description}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.foregroundMuted,
                        }}
                      >
                        <Clock size={12} />
                        {selectedCategory.responseTime}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      label={t('contact.form.name')}
                      icon={User}
                      value={name}
                      onChange={setName}
                      placeholder={t('contact.form.namePlaceholder')}
                      error={formErrors.name}
                      theme={theme}
                      cardRadius={cardRadius}
                      onClearError={() =>
                        setFormErrors((prev) => ({ ...prev, name: '' }))
                      }
                    />
                    <FormField
                      label={t('contact.form.email')}
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder={t('contact.form.emailPlaceholder')}
                      error={formErrors.email}
                      theme={theme}
                      cardRadius={cardRadius}
                      onClearError={() =>
                        setFormErrors((prev) => ({ ...prev, email: '' }))
                      }
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    label={t('contact.form.subject')}
                    icon={MessageSquare}
                    value={subject}
                    onChange={setSubject}
                    placeholder={t('contact.form.subjectPlaceholder')}
                    error={formErrors.subject}
                    theme={theme}
                    cardRadius={cardRadius}
                    onClearError={() =>
                      setFormErrors((prev) => ({ ...prev, subject: '' }))
                    }
                  />

                  {/* Message */}
                  <div>
                    <label
                      className="flex items-center gap-2 text-sm font-medium mb-2"
                      style={{ color: theme.colors.foreground }}
                    >
                      <MessageSquare
                        size={14}
                        style={{ color: theme.colors.primary }}
                      />
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        setFormErrors((prev) => ({ ...prev, message: '' }))
                      }}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={6}
                      className="w-full px-4 py-3 outline-none transition-all resize-none"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${formErrors.message ? '#ef4444' : theme.colors.border}`,
                        borderRadius: cardRadius,
                        color: theme.colors.foreground,
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      {formErrors.message ? (
                        <span className="text-xs flex items-center gap-1 text-red-500">
                          <AlertCircle size={12} /> {formErrors.message}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className="text-xs"
                        style={{
                          color:
                            message.length > 2000
                              ? '#ef4444'
                              : theme.colors.foregroundMuted,
                        }}
                      >
                        {message.length}/2000
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      borderRadius: cardRadius,
                      boxShadow:
                        glowOpacity > 0
                          ? `0 15px 40px ${theme.colors.primary}40`
                          : undefined,
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {t('contact.form.sending')}
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {t('contact.form.submit')}
                      </>
                    )}
                  </motion.button>

                  {/* Privacy Note */}
                  <p
                    className="text-xs text-center"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('contact.form.privacyNote')}{' '}
                    <Link
                      to="/privacy"
                      className="underline hover:no-underline"
                      style={{ color: theme.colors.primary }}
                    >
                      {t('contact.form.privacyLink')}
                    </Link>
                    {t('contact.form.privacyNote2')}
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-20 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('contact.faq.title')}{' '}
              <span style={{ color: theme.colors.primary }}>
                {t('contact.faq.titleHighlight')}
              </span>
            </h2>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('contact.faq.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl"
                    style={{ background: `${theme.colors.primary}15` }}
                  >
                    <faq.icon
                      size={18}
                      style={{ color: theme.colors.primary }}
                    />
                  </div>
                  <span
                    className="flex-1 font-semibold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-5 pb-5 pl-[72px]"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

interface FormFieldProps {
  label: string
  icon: React.ElementType
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  type?: string
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  onClearError: () => void
}

function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  theme,
  cardRadius,
  onClearError,
}: FormFieldProps) {
  return (
    <div>
      <label
        className="flex items-center gap-2 text-sm font-medium mb-2"
        style={{ color: theme.colors.foreground }}
      >
        <Icon size={14} style={{ color: theme.colors.primary }} />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onClearError()
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 outline-none transition-all"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${error ? '#ef4444' : theme.colors.border}`,
          borderRadius: cardRadius,
          color: theme.colors.foreground,
        }}
      />
      {error && (
        <span className="text-xs flex items-center gap-1 mt-1 text-red-500">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  )
}
