import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Phone,
  Scale,
  Shield,
  FileText,
  Globe,
  Bot,
  AlertTriangle,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/imprint')({
  head: () => ({
    meta: [
      { title: 'Imprint | Eziox' },
      {
        name: 'description',
        content: 'Impressum und rechtliche Angaben für Eziox gemäß § 5 DDG.',
      },
    ],
  }),
  component: ImprintPage,
})

const LAST_UPDATED = '29. Januar 2026'
const ACCENT_COLOR = '#8b5cf6'

export function ImprintPage() {
  const { t } = useTranslation()
  const sections: LegalSection[] = [
    {
      id: 'provider',
      title: t('imprint.sections.provider.title'),
      icon: Building2,
      content: t('imprint.sections.provider.content'),
    },
    {
      id: 'contact',
      title: t('imprint.sections.contact.title'),
      icon: Phone,
      content: t('imprint.sections.contact.content'),
    },
    {
      id: 'dispute-resolution',
      title: t('imprint.sections.disputeResolution.title'),
      icon: Scale,
      content: t('imprint.sections.disputeResolution.content'),
    },
    {
      id: 'social-media',
      title: t('imprint.sections.socialMedia.title'),
      icon: Globe,
      content: t('imprint.sections.socialMedia.content'),
    },
    {
      id: 'data-mining',
      title: t('imprint.sections.dataMining.title'),
      icon: Bot,
      content: t('imprint.sections.dataMining.content'),
    },
    {
      id: 'liability',
      title: t('imprint.sections.liability.title'),
      icon: AlertTriangle,
      content: t('imprint.sections.liability.content'),
    },
    {
      id: 'generator',
      title: t('imprint.sections.generator.title'),
      icon: FileText,
      content: t('imprint.sections.generator.content'),
    },
  ]

  const relatedLinks: RelatedLink[] = [
    {
      title: t('imprint.relatedLinks.privacy'),
      href: '/privacy',
      icon: Shield,
    },
    {
      title: t('imprint.relatedLinks.terms'),
      href: '/terms',
      icon: FileText,
    },
    {
      title: t('imprint.relatedLinks.cookies'),
      href: '/cookies',
      icon: FileText,
    },
  ]

  return (
    <LegalPageLayout
      title={t('imprint.title')}
      subtitle={t('imprint.subtitle')}
      badge={t('imprint.badge')}
      badgeIcon={Building2}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={sections}
      relatedLinks={relatedLinks}
    />
  )
}
