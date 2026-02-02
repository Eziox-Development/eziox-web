import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  Scale,
  User,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/widerruf')({
  head: () => ({
    meta: [
      { title: 'Widerrufsbelehrung | Eziox' },
      {
        name: 'description',
        content:
          'Widerrufsbelehrung für Eziox gemäß § 355 BGB. Informationen zu Ihrem Widerrufsrecht.',
      },
    ],
  }),
  component: WiderrufPage,
})

const LAST_UPDATED = '30. Januar 2026'
const ACCENT_COLOR = '#ef4444'

export function WiderrufPage() {
  const { t } = useTranslation()

  const SECTIONS: LegalSection[] = [
    {
      id: 'verbraucher',
      title: t('widerruf.sections.verbraucher.title'),
      icon: User,
      content: t('widerruf.sections.verbraucher.content'),
    },
    {
      id: 'widerrufsrecht',
      title: t('widerruf.sections.widerrufsrecht.title'),
      icon: RotateCcw,
      content: t('widerruf.sections.widerrufsrecht.content'),
    },
    {
      id: 'folgen',
      title: t('widerruf.sections.folgen.title'),
      icon: AlertCircle,
      content: t('widerruf.sections.folgen.content'),
    },
    {
      id: 'erloeschen',
      title: t('widerruf.sections.erloeschen.title'),
      icon: Clock,
      content: t('widerruf.sections.erloeschen.content'),
    },
    {
      id: 'muster',
      title: t('widerruf.sections.muster.title'),
      icon: FileText,
      content: t('widerruf.sections.muster.content'),
    },
  ]

  const RELATED_LINKS: RelatedLink[] = [
    { title: t('widerruf.relatedLinks.terms'), href: '/terms', icon: Scale },
    {
      title: t('widerruf.relatedLinks.privacy'),
      href: '/privacy',
      icon: Shield,
    },
    {
      title: t('widerruf.relatedLinks.imprint'),
      href: '/imprint',
      icon: FileText,
    },
  ]

  return (
    <LegalPageLayout
      title={t('widerruf.title')}
      subtitle={t('widerruf.subtitle')}
      badge={t('widerruf.badge')}
      badgeIcon={RotateCcw}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
      generatorCredit={{
        text: t('widerruf.generator.text'),
        url: 'https://www.datenschutz-generator.de/',
        name: 'Dr. Thomas Schwenke',
      }}
    />
  )
}
