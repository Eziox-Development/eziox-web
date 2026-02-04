import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion } from 'motion/react'
import {
  Building2,
  Send,
  CheckCircle,
  Briefcase,
  Server,
  Store,
  Users,
  HelpCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitLicenseInquiryFn } from '@/server/functions/legal'

export const Route = createFileRoute('/_public/licensing')({
  head: () => ({
    meta: [
      { title: 'Commercial Licensing | Eziox' },
      {
        name: 'description',
        content: 'Get a commercial license for Eziox. Enterprise deployments, SaaS offerings, and custom licensing options available.',
      },
    ],
  }),
  component: LicensingPage,
})

type LicenseType = 'commercial' | 'enterprise' | 'saas' | 'reseller' | 'other'

const LICENSE_TYPES: { value: LicenseType; icon: React.ElementType; color: string }[] = [
  { value: 'commercial', icon: Briefcase, color: '#8b5cf6' },
  { value: 'enterprise', icon: Building2, color: '#3b82f6' },
  { value: 'saas', icon: Server, color: '#22c55e' },
  { value: 'reseller', icon: Store, color: '#f59e0b' },
  { value: 'other', icon: HelpCircle, color: '#6b7280' },
]

const USER_COUNTS = ['1-10', '11-50', '51-200', '201-1000', '1000+'] as const
const BUDGETS = ['under_1k', '1k_5k', '5k_10k', '10k_plus', 'enterprise'] as const
const TIMELINES = ['immediate', '1_month', '3_months', '6_months', 'exploring'] as const

export function LicensingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const submitInquiry = useServerFn(submitLicenseInquiryFn)

  const [submitted, setSubmitted] = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    phone: '',
    licenseType: null as LicenseType | null,
    useCase: '',
    expectedUsers: '' as typeof USER_COUNTS[number] | '',
    budget: '' as typeof BUDGETS[number] | '',
    timeline: '' as typeof TIMELINES[number] | '',
    additionalNotes: '',
  })

  const mutation = useMutation({
    mutationFn: () =>
      submitInquiry({
        data: {
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          website: formData.website || undefined,
          phone: formData.phone || undefined,
          licenseType: formData.licenseType!,
          useCase: formData.useCase,
          expectedUsers: formData.expectedUsers || undefined,
          budget: formData.budget || undefined,
          timeline: formData.timeline || undefined,
          additionalNotes: formData.additionalNotes || undefined,
        },
      }),
    onSuccess: (data) => {
      setSubmitted(true)
      setInquiryId(data.inquiryId)
    },
  })

  const canSubmit =
    formData.name.length >= 2 &&
    formData.email.includes('@') &&
    formData.licenseType !== null &&
    formData.useCase.length >= 50

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center p-8 rounded-2xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#22c55e20' }}>
            <CheckCircle size={32} style={{ color: '#22c55e' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
            {t('licensing.submitted.title')}
          </h1>
          <p className="mb-4" style={{ color: theme.colors.foregroundMuted }}>
            {t('licensing.submitted.description')}
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background: `${theme.colors.foreground}05` }}>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('licensing.submitted.referenceId')}
            </p>
            <p className="font-mono font-bold" style={{ color: theme.colors.primary }}>
              #{inquiryId?.slice(0, 8)}
            </p>
          </div>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {t('licensing.submitted.timeline')}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: theme.colors.background }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
            <Building2 size={32} style={{ color: theme.colors.primary }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
            {t('licensing.title')}
          </h1>
          <p style={{ color: theme.colors.foregroundMuted }}>
            {t('licensing.description')}
          </p>
        </div>

        {/* License Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
            <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>
              {t('licensing.info.sourceAvailable')}
            </h3>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('licensing.info.sourceAvailableDesc')}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
            <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>
              {t('licensing.info.nonCommercial')}
            </h3>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('licensing.info.nonCommercialDesc')}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
            <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>
              {t('licensing.info.commercial')}
            </h3>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('licensing.info.commercialDesc')}
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.foreground }}>
            {t('licensing.form.title')}
          </h2>

          <div className="space-y-6">
            {/* License Type */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.foreground }}>
                {t('licensing.form.licenseType')} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {LICENSE_TYPES.map(({ value, icon: Icon, color }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setFormData({ ...formData, licenseType: value })}
                    className="p-3 rounded-xl text-center transition-all"
                    style={{
                      background: formData.licenseType === value ? `${color}15` : `${theme.colors.foreground}05`,
                      border: `2px solid ${formData.licenseType === value ? color : 'transparent'}`,
                    }}
                  >
                    <Icon size={20} style={{ color }} className="mx-auto mb-1" />
                    <p className="text-xs font-medium" style={{ color: theme.colors.foreground }}>
                      {t(`licensing.types.${value}`)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                  {t('licensing.form.name')} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                  {t('licensing.form.email')} *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                  {t('licensing.form.company')}
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                  {t('licensing.form.website')}
                </label>
                <Input
                  type="url"
                  placeholder="https://"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                {t('licensing.form.useCase')} *
              </label>
              <textarea
                className="w-full p-3 rounded-xl resize-none"
                rows={4}
                placeholder={t('licensing.form.useCasePlaceholder')}
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                style={{
                  background: `${theme.colors.foreground}05`,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              />
              <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
                {formData.useCase.length}/50 {t('licensing.form.minChars')}
              </p>
            </div>

            {/* Expected Users */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                <Users size={14} className="inline mr-1" />
                {t('licensing.form.expectedUsers')}
              </label>
              <div className="flex flex-wrap gap-2">
                {USER_COUNTS.map((count) => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setFormData({ ...formData, expectedUsers: count })}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.expectedUsers === count ? theme.colors.primary : `${theme.colors.foreground}10`,
                      color: formData.expectedUsers === count ? '#fff' : theme.colors.foreground,
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                {t('licensing.form.budget')}
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((budget) => (
                  <button
                    type="button"
                    key={budget}
                    onClick={() => setFormData({ ...formData, budget })}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.budget === budget ? theme.colors.primary : `${theme.colors.foreground}10`,
                      color: formData.budget === budget ? '#fff' : theme.colors.foreground,
                    }}
                  >
                    {t(`licensing.budgets.${budget}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                {t('licensing.form.timeline')}
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMELINES.map((timeline) => (
                  <button
                    type="button"
                    key={timeline}
                    onClick={() => setFormData({ ...formData, timeline })}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.timeline === timeline ? theme.colors.primary : `${theme.colors.foreground}10`,
                      color: formData.timeline === timeline ? '#fff' : theme.colors.foreground,
                    }}
                  >
                    {t(`licensing.timelines.${timeline}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                {t('licensing.form.additionalNotes')}
              </label>
              <textarea
                className="w-full p-3 rounded-xl resize-none"
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                style={{
                  background: `${theme.colors.foreground}05`,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.foreground,
                }}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.colors.border }}>
              <a
                href="mailto:business@eziox.link"
                className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: theme.colors.primary }}
              >
                <ExternalLink size={14} />
                {t('licensing.form.directContact')}
              </a>
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {t('licensing.form.submit')}
              </Button>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500 text-center">
                {t('licensing.error')}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
