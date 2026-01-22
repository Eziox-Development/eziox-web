import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
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
  Handshake,
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

const CONTACT_CATEGORIES = [
  {
    id: 'general',
    label: 'General Inquiry',
    icon: HelpCircle,
    color: '#6366f1',
    description: 'Questions about Eziox',
    responseTime: '24-48h',
  },
  {
    id: 'support',
    label: 'Technical Support',
    icon: Bug,
    color: '#ef4444',
    description: 'Report bugs or issues',
    responseTime: '12-24h',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: Handshake,
    color: '#22c55e',
    description: 'Business opportunities',
    responseTime: '48-72h',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: Sparkles,
    color: '#f59e0b',
    description: 'Suggest new features',
    responseTime: '24-48h',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: '#8b5cf6',
    description: 'Report vulnerabilities',
    responseTime: 'Priority',
  },
] as const

type CategoryId = (typeof CONTACT_CATEGORIES)[number]['id']

const QUICK_LINKS = [
  {
    icon: SiDiscord,
    label: 'Discord Community',
    href: 'https://discord.com/invite/KD84DmNA89',
    description: 'Join 1,000+ members',
    color: '#5865F2',
  },
  {
    icon: SiGithub,
    label: 'GitHub Issues',
    href: 'https://github.com/Eziox-Development/eziox-web/issues',
    description: 'Report bugs',
    color: '#ffffff',
  },
  {
    icon: Mail,
    label: 'Email Us',
    href: 'mailto:support@eziox.link',
    description: 'support@eziox.link',
    color: '#22c55e',
  },
]

const FAQ_ITEMS = [
  {
    q: 'How quickly will I get a response?',
    a: 'We typically respond within 24-48 hours for general inquiries. Support tickets are prioritized and usually answered within 12-24 hours. Security reports receive immediate attention.',
    icon: Clock,
  },
  {
    q: 'Can I report security vulnerabilities?',
    a: 'Yes! Please select the "Security" category for responsible disclosure. Security reports are treated with highest priority and you may be eligible for our bug bounty program.',
    icon: Shield,
  },
  {
    q: 'How can I become a partner?',
    a: 'Select "Partnership" and tell us about your platform, audience, and collaboration ideas. We\'re always looking for creators and businesses to work with.',
    icon: Handshake,
  },
  {
    q: 'Is there a Discord community?',
    a: "Yes! Join our Discord server for instant help from the community and team. It's the fastest way to get answers and connect with other creators.",
    icon: MessageSquare,
  },
]

function ContactPage() {
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

  const borderRadius =
    theme.effects.borderRadius === 'pill'
      ? '9999px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.4
      : theme.effects.glowIntensity === 'medium'
        ? 0.25
        : theme.effects.glowIntensity === 'subtle'
          ? 0.15
          : 0

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
      toast.success('Message sent successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = 'Name is required'
    if (!email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Invalid email format'
    if (!subject.trim()) errors.subject = 'Subject is required'
    else if (subject.length < 5)
      errors.subject = 'Subject too short (min 5 chars)'
    if (!message.trim()) errors.message = 'Message is required'
    else if (message.length < 20)
      errors.message = 'Message too short (min 20 chars)'
    else if (message.length > 2000)
      errors.message = 'Message too long (max 2000 chars)'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    submitMutation.mutate()
  }

  const selectedCategory = CONTACT_CATEGORIES.find((c) => c.id === category)

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
            background:
              theme.effects.cardStyle === 'glass'
                ? `${theme.colors.card}80`
                : theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
            backdropFilter:
              theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
              borderRadius: '50%',
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
            Message Sent!
          </h1>
          <p
            className="text-lg mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Thank you for reaching out to us.
          </p>
          <p className="mb-8" style={{ color: theme.colors.foregroundMuted }}>
            We'll get back to you within{' '}
            <strong style={{ color: theme.colors.foreground }}>
              {selectedCategory?.responseTime || '24-48h'}
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
                  borderRadius,
                  color: theme.colors.foreground,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home size={18} /> Back to Home
              </motion.button>
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="flex items-center gap-2 px-6 py-3 font-medium"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                borderRadius,
                color: '#fff',
              }}
            >
              <Send size={18} /> Send Another
            </button>
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
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.5,
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.4,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-6"
              style={{
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius,
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
                Get in Touch
              </span>
            </motion.div>

            <h1
              className="text-4xl lg:text-6xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              How Can We{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  textShadow:
                    glowOpacity > 0
                      ? `0 0 40px ${theme.colors.primary}40`
                      : undefined,
                }}
              >
                Help
              </span>
              ?
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Have a question, feedback, or want to partner with us? We'd love
              to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group p-5 flex items-center gap-4 transition-all"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
                }}
                whileHover={{
                  y: -4,
                  boxShadow: `0 20px 40px ${theme.colors.primary}15`,
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center shrink-0"
                  style={{
                    background: `${link.color}15`,
                    borderRadius: '12px',
                  }}
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
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
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
                  Select Category
                </h2>

                <div className="space-y-2">
                  {CONTACT_CATEGORIES.map((cat) => (
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
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                          background: `${cat.color}20`,
                          borderRadius: '10px',
                        }}
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
                            className="w-5 h-5 flex items-center justify-center"
                            style={{
                              background: cat.color,
                              borderRadius: '50%',
                            }}
                          >
                            <CheckCircle2 size={12} className="text-white" />
                          </motion.div>
                        )}
                        <span
                          className="text-[10px] font-medium px-2 py-0.5"
                          style={{
                            background:
                              cat.id === 'security'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : theme.colors.backgroundSecondary,
                            color:
                              cat.id === 'security'
                                ? '#ef4444'
                                : theme.colors.foregroundMuted,
                            borderRadius: '4px',
                          }}
                        >
                          {cat.responseTime}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Response Time Info */}
                <div
                  className="mt-6 p-4"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: cardRadius,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} style={{ color: theme.colors.primary }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: theme.colors.foreground }}
                    >
                      Quick Tips
                    </span>
                  </div>
                  <ul
                    className="space-y-2 text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      Be specific about your issue or question
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      Include relevant details (browser, device, etc.)
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: theme.colors.primary }}>•</span>
                      Check Discord for faster community support
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
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}80`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(10px)'
                      : undefined,
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
                        className="w-12 h-12 flex items-center justify-center"
                        style={{
                          background: `${selectedCategory.color}20`,
                          borderRadius: '14px',
                        }}
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
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          borderRadius,
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
                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      label="Your Name"
                      icon={User}
                      value={name}
                      onChange={setName}
                      placeholder="John Doe"
                      error={formErrors.name}
                      theme={theme}
                      borderRadius={borderRadius}
                    />
                    <FormField
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="john@example.com"
                      error={formErrors.email}
                      theme={theme}
                      borderRadius={borderRadius}
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    label="Subject"
                    icon={MessageSquare}
                    value={subject}
                    onChange={setSubject}
                    placeholder="Brief description of your inquiry"
                    error={formErrors.subject}
                    theme={theme}
                    borderRadius={borderRadius}
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
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        setFormErrors((prev) => ({ ...prev, message: '' }))
                      }}
                      placeholder="Please describe your question, issue, or feedback in detail..."
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

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      borderRadius,
                      boxShadow:
                        glowOpacity > 0
                          ? `0 8px 32px ${theme.colors.primary}40`
                          : undefined,
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  {/* Privacy Note */}
                  <p
                    className="text-xs text-center"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    By submitting this form, you agree to our{' '}
                    <Link
                      to="/privacy"
                      className="underline hover:no-underline"
                      style={{ color: theme.colors.primary }}
                    >
                      Privacy Policy
                    </Link>
                    . We'll never share your information with third parties.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Frequently Asked{' '}
              <span style={{ color: theme.colors.primary }}>Questions</span>
            </h2>
            <p style={{ color: theme.colors.foregroundMuted }}>
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
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
                    className="w-10 h-10 shrink-0 flex items-center justify-center"
                    style={{
                      background: `${theme.colors.primary}15`,
                      borderRadius: '10px',
                    }}
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
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      size={20}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pl-[72px]">
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {faq.a}
                        </p>
                      </div>
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

function FormField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  theme,
  borderRadius,
}: {
  label: string
  icon: typeof User
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  error?: string
  theme: ReturnType<typeof useTheme>['theme']
  borderRadius: string
}) {
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 outline-none transition-all"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${error ? '#ef4444' : theme.colors.border}`,
          borderRadius,
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
