import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion } from 'motion/react'
import {
  Shield,
  FileWarning,
  Send,
  CheckCircle,
  AlertTriangle,
  Copyright,
  Tag,
  UserX,
  Lock,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitTakedownRequestFn } from '@/server/functions/legal'

export const Route = createFileRoute('/_public/takedown')({
  head: () => ({
    meta: [
      { title: 'DMCA & Takedown Request | Eziox' },
      {
        name: 'description',
        content: 'Submit a DMCA or content takedown request for Eziox. Report copyright infringement, trademark violations, or other content issues.',
      },
    ],
  }),
  component: TakedownPage,
})

type ClaimType = 'copyright' | 'trademark' | 'defamation' | 'privacy' | 'other'
type ContentType = 'profile' | 'link' | 'image' | 'bio' | 'username' | 'other'

const CLAIM_TYPES: { value: ClaimType; icon: React.ElementType; color: string }[] = [
  { value: 'copyright', icon: Copyright, color: '#ef4444' },
  { value: 'trademark', icon: Tag, color: '#f59e0b' },
  { value: 'defamation', icon: UserX, color: '#8b5cf6' },
  { value: 'privacy', icon: Lock, color: '#3b82f6' },
  { value: 'other', icon: HelpCircle, color: '#6b7280' },
]

const CONTENT_TYPES: ContentType[] = ['profile', 'link', 'image', 'bio', 'username', 'other']

export function TakedownPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const submitTakedown = useServerFn(submitTakedownRequestFn)

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  // Form state
  const [claimType, setClaimType] = useState<ClaimType | null>(null)
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterCompany: '',
    requesterAddress: '',
    requesterPhone: '',
    contentUrl: '',
    reportedUsername: '',
    originalWorkUrl: '',
    description: '',
    goodFaithStatement: false,
    accuracyStatement: false,
  })

  const mutation = useMutation({
    mutationFn: () =>
      submitTakedown({
        data: {
          ...formData,
          claimType: claimType!,
          contentType: contentType!,
          requesterCompany: formData.requesterCompany || undefined,
          requesterAddress: formData.requesterAddress || undefined,
          requesterPhone: formData.requesterPhone || undefined,
          reportedUsername: formData.reportedUsername || undefined,
          originalWorkUrl: formData.originalWorkUrl || undefined,
        },
      }),
    onSuccess: (data) => {
      setSubmitted(true)
      setRequestId(data.requestId)
    },
  })

  const canProceedStep1 = claimType !== null
  const canProceedStep2 = contentType !== null && formData.contentUrl.length > 0
  const canProceedStep3 =
    formData.requesterName.length >= 2 &&
    formData.requesterEmail.includes('@') &&
    formData.description.length >= 50
  const canSubmit = formData.goodFaithStatement && formData.accuracyStatement

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
            {t('takedown.submitted.title')}
          </h1>
          <p className="mb-4" style={{ color: theme.colors.foregroundMuted }}>
            {t('takedown.submitted.description')}
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background: `${theme.colors.foreground}05` }}>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('takedown.submitted.requestId')}
            </p>
            <p className="font-mono font-bold" style={{ color: theme.colors.primary }}>
              #{requestId?.slice(0, 8)}
            </p>
          </div>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {t('takedown.submitted.timeline')}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: theme.colors.background }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${theme.colors.primary}20` }}>
            <Shield size={32} style={{ color: theme.colors.primary }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.foreground }}>
            {t('takedown.title')}
          </h1>
          <p style={{ color: theme.colors.foregroundMuted }}>
            {t('takedown.description')}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: step >= s ? theme.colors.primary : `${theme.colors.foreground}20`,
                transform: step === s ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        >
          {/* Step 1: Claim Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.foreground }}>
                {t('takedown.step1.title')}
              </h2>
              <p className="mb-6" style={{ color: theme.colors.foregroundMuted }}>
                {t('takedown.step1.description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLAIM_TYPES.map(({ value, icon: Icon, color }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setClaimType(value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: claimType === value ? `${color}15` : `${theme.colors.foreground}05`,
                      border: `2px solid ${claimType === value ? color : 'transparent'}`,
                    }}
                  >
                    <Icon size={24} style={{ color }} className="mb-2" />
                    <p className="font-medium" style={{ color: theme.colors.foreground }}>
                      {t(`takedown.claimTypes.${value}`)}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                      {t(`takedown.claimTypes.${value}Desc`)}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Content Info */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.foreground }}>
                {t('takedown.step2.title')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step2.contentType')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setContentType(type)}
                        className="px-4 py-2 rounded-lg text-sm transition-all"
                        style={{
                          background: contentType === type ? theme.colors.primary : `${theme.colors.foreground}10`,
                          color: contentType === type ? '#fff' : theme.colors.foreground,
                        }}
                      >
                        {t(`takedown.contentTypes.${type}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step2.contentUrl')} *
                  </label>
                  <Input
                    type="url"
                    placeholder="https://eziox.link/username"
                    value={formData.contentUrl}
                    onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step2.reportedUsername')}
                  </label>
                  <Input
                    placeholder="username"
                    value={formData.reportedUsername}
                    onChange={(e) => setFormData({ ...formData, reportedUsername: e.target.value })}
                  />
                </div>
                {claimType === 'copyright' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      {t('takedown.step2.originalWorkUrl')}
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/original-work"
                      value={formData.originalWorkUrl}
                      onChange={(e) => setFormData({ ...formData, originalWorkUrl: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t('common.back')}
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info & Description */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.foreground }}>
                {t('takedown.step3.title')}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      {t('takedown.step3.name')} *
                    </label>
                    <Input
                      value={formData.requesterName}
                      onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      {t('takedown.step3.email')} *
                    </label>
                    <Input
                      type="email"
                      value={formData.requesterEmail}
                      onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      {t('takedown.step3.company')}
                    </label>
                    <Input
                      value={formData.requesterCompany}
                      onChange={(e) => setFormData({ ...formData, requesterCompany: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      {t('takedown.step3.phone')}
                    </label>
                    <Input
                      value={formData.requesterPhone}
                      onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step3.description')} *
                  </label>
                  <textarea
                    className="w-full p-3 rounded-xl resize-none"
                    rows={5}
                    placeholder={t('takedown.step3.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      background: `${theme.colors.foreground}05`,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.foreground,
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
                    {formData.description.length}/50 {t('takedown.step3.minChars')}
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  {t('common.back')}
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canProceedStep3}>
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Legal Statements */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.foreground }}>
                {t('takedown.step4.title')}
              </h2>
              <div className="p-4 rounded-xl mb-6" style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
                <div className="flex gap-3">
                  <AlertTriangle size={20} style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step4.warning')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer" style={{ background: `${theme.colors.foreground}05` }}>
                  <input
                    type="checkbox"
                    checked={formData.goodFaithStatement}
                    onChange={(e) => setFormData({ ...formData, goodFaithStatement: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-sm" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step4.goodFaith')}
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer" style={{ background: `${theme.colors.foreground}05` }}>
                  <input
                    type="checkbox"
                    checked={formData.accuracyStatement}
                    onChange={(e) => setFormData({ ...formData, accuracyStatement: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-sm" style={{ color: theme.colors.foreground }}>
                    {t('takedown.step4.accuracy')}
                  </span>
                </label>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(3)}>
                  {t('common.back')}
                </Button>
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
                  {t('takedown.submit')}
                </Button>
              </div>
              {mutation.isError && (
                <p className="text-sm text-red-500 mt-4 text-center">
                  {t('takedown.error')}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-xl" style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}` }}>
          <div className="flex gap-3">
            <FileWarning size={20} style={{ color: theme.colors.foregroundMuted }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: theme.colors.foreground }}>
                {t('takedown.info.title')}
              </p>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                {t('takedown.info.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
