import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  Scale,
  User,
  MapPin,
  Mail,
  Globe,
  Building2,
  FileText,
  Shield,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/_public/imprint')({
  head: () => ({
    meta: [
      { title: 'Imprint | Eziox' },
      { name: 'description', content: 'Legal information and imprint for Eziox - Bio link platform.' },
    ],
  }),
  component: ImprintPage,
})

const IMPRINT_DATA = {
  name: 'Saito',
  role: 'Individual Developer / Sole Proprietor',
  address: {
    street: 'Available upon request',
    city: 'Germany',
    country: 'Germany',
  },
  contact: {
    email: 'contact@eziox.link',
    website: 'https://eziox.link',
  },
  legal: {
    vatId: 'Not applicable (Kleinunternehmer §19 UStG)',
    registrationNumber: 'Not applicable',
  },
}

function ImprintPage() {
  const { theme } = useTheme()

  const sections = [
    {
      icon: User,
      title: 'Responsible for Content',
      content: (
        <div className="space-y-2">
          <p className="font-semibold" style={{ color: theme.colors.foreground }}>{IMPRINT_DATA.name}</p>
          <p style={{ color: theme.colors.foregroundMuted }}>{IMPRINT_DATA.role}</p>
        </div>
      ),
    },
    {
      icon: MapPin,
      title: 'Address',
      content: (
        <div className="space-y-1">
          <p style={{ color: theme.colors.foregroundMuted }}>{IMPRINT_DATA.address.street}</p>
          <p style={{ color: theme.colors.foregroundMuted }}>{IMPRINT_DATA.address.city}</p>
          <p style={{ color: theme.colors.foregroundMuted }}>{IMPRINT_DATA.address.country}</p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: 'Contact',
      content: (
        <div className="space-y-2">
          <a href={`mailto:${IMPRINT_DATA.contact.email}`} className="flex items-center gap-2 hover:underline" style={{ color: theme.colors.primary }}>
            <Mail size={14} />
            {IMPRINT_DATA.contact.email}
          </a>
          <a href={IMPRINT_DATA.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: theme.colors.primary }}>
            <Globe size={14} />
            {IMPRINT_DATA.contact.website}
            <ExternalLink size={12} />
          </a>
        </div>
      ),
    },
    {
      icon: Building2,
      title: 'Business Information',
      content: (
        <div className="space-y-2">
          <div>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>VAT ID</p>
            <p style={{ color: theme.colors.foreground }}>{IMPRINT_DATA.legal.vatId}</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>Registration</p>
            <p style={{ color: theme.colors.foreground }}>{IMPRINT_DATA.legal.registrationNumber}</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
            <Scale size={16} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Legal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
            Imprint
          </h1>
          <p className="text-lg" style={{ color: theme.colors.foregroundMuted }}>
            Legal information according to § 5 TMG (German Telemedia Act)
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${theme.colors.primary}15` }}>
                  <section.icon size={24} style={{ color: theme.colors.primary }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-3" style={{ color: theme.colors.foreground }}>{section.title}</h2>
                  {section.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <Shield size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ color: theme.colors.foreground }}>Disclaimer</h2>
              <div className="space-y-3 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                <p>
                  <strong style={{ color: theme.colors.foreground }}>Liability for Content:</strong> The contents of our pages were created with the greatest care. However, we cannot guarantee the accuracy, completeness, and timeliness of the content.
                </p>
                <p>
                  <strong style={{ color: theme.colors.foreground }}>Liability for Links:</strong> Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this external content.
                </p>
                <p>
                  <strong style={{ color: theme.colors.foreground }}>Copyright:</strong> The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, or any form of commercialization of such material beyond the scope of the copyright law requires the prior written consent of its respective author or creator.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          {[
            { label: 'Privacy Policy', href: '/privacy', icon: FileText },
            { label: 'Terms of Service', href: '/terms', icon: Scale },
            { label: 'Contact', href: '/contact', icon: Mail },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
            >
              <link.icon size={16} style={{ color: theme.colors.primary }} />
              {link.label}
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
