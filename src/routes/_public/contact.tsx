import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { submitContactFormFn } from '@/server/functions/contact'
import { useTheme } from '@/components/portfolio/ThemeProvider'
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
} from 'lucide-react'
import { SiDiscord, SiGithub } from 'react-icons/si'

export const Route = createFileRoute('/_public/contact')({
  head: () => ({
    meta: [
      { title: 'Contact Us | Eziox' },
      { name: 'description', content: 'Get in touch with the Eziox team. We\'re here to help with questions, feedback, partnerships, and support.' },
    ],
  }),
  component: ContactPage,
})

const CONTACT_CATEGORIES = [
  { id: 'general', label: 'General Inquiry', icon: HelpCircle, color: '#6366f1', description: 'Questions about Eziox' },
  { id: 'support', label: 'Technical Support', icon: Bug, color: '#ef4444', description: 'Report bugs or issues' },
  { id: 'partnership', label: 'Partnership', icon: Handshake, color: '#22c55e', description: 'Business opportunities' },
  { id: 'feature', label: 'Feature Request', icon: Sparkles, color: '#f59e0b', description: 'Suggest new features' },
  { id: 'security', label: 'Security', icon: Shield, color: '#8b5cf6', description: 'Report vulnerabilities' },
] as const

type CategoryId = typeof CONTACT_CATEGORIES[number]['id']

const QUICK_LINKS = [
  { icon: SiDiscord, label: 'Discord Community', href: 'https://discord.com/invite/KD84DmNA89', description: 'Join 1,000+ members for instant help' },
  { icon: SiGithub, label: 'GitHub Issues', href: 'https://github.com/Eziox-Development/eziox-web/issues', description: 'Report bugs or request features' },
  { icon: Mail, label: 'Email Us', href: 'mailto:support@eziox.link', description: 'support@eziox.link' },
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

  const submitMutation = useMutation({
    mutationFn: () => submitContact({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    submitMutation.mutate()
  }

  const selectedCategory = CONTACT_CATEGORIES.find(c => c.id === category)

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: 'var(--background)' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 rounded-3xl"
            style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CheckCircle2 size={48} className="text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
              Message Sent!
            </h1>
            <p className="text-lg mb-2" style={{ color: theme.colors.foregroundMuted }}>
              Thank you for reaching out to us.
            </p>
            <p className="mb-8" style={{ color: theme.colors.foregroundMuted }}>
              We typically respond within 24-48 hours.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm" style={{ color: theme.colors.foregroundMuted }}>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Response time: 24-48h</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>Check your inbox</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: theme.colors.accent }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
              <MessageSquare size={16} style={{ color: theme.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Get in Touch</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
              How Can We Help?
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
              Have a question, feedback, or want to partner with us? We'd love to hear from you.
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
                transition={{ delay: i * 0.1 }}
                className="group p-5 rounded-2xl flex items-center gap-4 transition-all"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                whileHover={{ y: -4, boxShadow: `0 20px 40px ${theme.colors.primary}15` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${theme.colors.primary}15` }}>
                  <link.icon size={24} style={{ color: theme.colors.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-0.5" style={{ color: theme.colors.foreground }}>{link.label}</h3>
                  <p className="text-sm truncate" style={{ color: theme.colors.foregroundMuted }}>{link.description}</p>
                </div>
                <ArrowRight size={18} style={{ color: theme.colors.foregroundMuted }} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Category Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
                Select Category
              </h2>
              <div className="space-y-2">
                {CONTACT_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="w-full p-4 rounded-xl flex items-center gap-4 text-left transition-all"
                    style={{
                      background: category === cat.id ? `${cat.color}15` : theme.colors.card,
                      border: `1px solid ${category === cat.id ? cat.color : theme.colors.border}`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cat.color}20` }}
                    >
                      <cat.icon size={20} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>{cat.label}</p>
                      <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{cat.description}</p>
                    </div>
                    {category === cat.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: cat.color }}
                      >
                        <CheckCircle2 size={14} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Response Time Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-xl"
                style={{ background: theme.colors.backgroundSecondary, border: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={18} style={{ color: theme.colors.primary }} />
                  <span className="font-medium" style={{ color: theme.colors.foreground }}>Response Times</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.foregroundMuted }}>General</span>
                    <span style={{ color: theme.colors.foreground }}>24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.foregroundMuted }}>Support</span>
                    <span style={{ color: theme.colors.foreground }}>12-24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.foregroundMuted }}>Security</span>
                    <span style={{ color: '#ef4444' }}>Priority</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="p-6 lg:p-8 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
                <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  {selectedCategory && (
                    <>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${selectedCategory.color}20` }}>
                        <selectedCategory.icon size={20} style={{ color: selectedCategory.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>{selectedCategory.label}</h3>
                        <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{selectedCategory.description}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                        <User size={14} className="inline mr-2" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.foreground,
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                        <Mail size={14} className="inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          border: `1px solid ${theme.colors.border}`,
                          color: theme.colors.foreground,
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      <MessageSquare size={14} className="inline mr-2" />
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your inquiry"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      <MessageSquare size={14} className="inline mr-2" />
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question, issue, or feedback in detail..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all resize-none"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                      required
                    />
                    <p className="text-xs mt-2" style={{ color: theme.colors.foregroundMuted }}>
                      {message.length}/2000 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                    whileHover={{ scale: 1.02 }}
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
                  <p className="text-xs text-center" style={{ color: theme.colors.foregroundMuted }}>
                    By submitting this form, you agree to our{' '}
                    <a href="/privacy" className="underline hover:no-underline" style={{ color: theme.colors.primary }}>Privacy Policy</a>.
                    We'll never share your information with third parties.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4" style={{ background: theme.colors.backgroundSecondary }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: theme.colors.foregroundMuted }}>
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: 'How quickly will I get a response?', a: 'We typically respond within 24-48 hours for general inquiries. Support tickets are prioritized and usually answered within 12-24 hours.' },
              { q: 'Can I report security vulnerabilities?', a: 'Yes! Please select the "Security" category for responsible disclosure. Security reports are treated with highest priority and you may be eligible for our bug bounty program.' },
              { q: 'How can I become a partner?', a: 'Select "Partnership" and tell us about your platform, audience, and collaboration ideas. We\'re always looking for creators and businesses to work with.' },
              { q: 'Is there a Discord community?', a: 'Yes! Join our Discord server for instant help from the community and team. It\'s the fastest way to get answers and connect with other creators.' },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl"
                style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              >
                <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>{faq.q}</h3>
                <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
