import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  getPasskeysFn,
  getPasskeyRegistrationOptionsFn,
  verifyPasskeyRegistrationFn,
  deletePasskeyFn,
  renamePasskeyFn,
} from '@/server/functions/auth'
import {
  Fingerprint,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  Smartphone,
  Monitor,
  Key,
  Edit2,
  X,
  Mail,
  Clock,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import type { ProfileUser } from '../types'

interface SecurityTabProps {
  currentUser: ProfileUser
}

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

export function SecurityTab({ currentUser }: SecurityTabProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const { colors } = theme

  const [showAddPasskey, setShowAddPasskey] = useState(false)
  const [passkeyName, setPasskeyName] = useState('')
  const [editingPasskey, setEditingPasskey] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Server functions
  const getPasskeys = useServerFn(getPasskeysFn)
  const getRegistrationOptions = useServerFn(getPasskeyRegistrationOptionsFn)
  const verifyRegistration = useServerFn(verifyPasskeyRegistrationFn)
  const deletePasskey = useServerFn(deletePasskeyFn)
  const renamePasskey = useServerFn(renamePasskeyFn)

  // Queries
  const { data: passkeysData, isLoading: passkeysLoading } = useQuery({
    queryKey: ['passkeys'],
    queryFn: () => getPasskeys(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutations
  const addPasskeyMutation = useMutation({
    mutationFn: async () => {
      if (!window.PublicKeyCredential) {
        throw new Error(t('security.passkeys.errors.notSupported'))
      }

      // Get registration options
      const { options } = await getRegistrationOptions({ data: { name: passkeyName || 'Passkey' } })

      // Convert challenge to ArrayBuffer
      const challengeBuffer = Uint8Array.from(options.challenge, (c) => c.charCodeAt(0))
      const userIdBuffer = Uint8Array.from(options.user.id, (c) => c.charCodeAt(0))

      // Create credential
      let credential: PublicKeyCredential | null = null
      try {
        credential = await navigator.credentials.create({
          publicKey: {
            challenge: challengeBuffer,
            rp: options.rp,
            user: {
              ...options.user,
              id: userIdBuffer,
            },
            pubKeyCredParams: options.pubKeyCredParams,
            timeout: options.timeout,
            attestation: options.attestation as AttestationConveyancePreference,
            authenticatorSelection: options.authenticatorSelection,
          },
        }) as PublicKeyCredential
      } catch (err) {
        // Catch WebAuthn errors and provide user-friendly messages
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            throw new Error(t('security.passkeys.errors.cancelled'))
          }
          if (err.name === 'TimeoutError') {
            throw new Error(t('security.passkeys.errors.timeout'))
          }
          if (err.name === 'SecurityError') {
            throw new Error(t('security.passkeys.errors.security'))
          }
          if (err.name === 'NotSupportedError') {
            throw new Error(t('security.passkeys.errors.notSupported'))
          }
        }
        // Generic error for unknown cases
        throw new Error(t('security.passkeys.errors.failed'))
      }

      if (!credential) {
        throw new Error(t('security.passkeys.errors.cancelled'))
      }

      const response = credential.response as AuthenticatorAttestationResponse

      // Verify registration
      await verifyRegistration({
        data: {
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
              attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
            },
            type: 'public-key',
            authenticatorAttachment: (credential as PublicKeyCredential & { authenticatorAttachment?: string }).authenticatorAttachment,
          },
        },
      })

      return { success: true }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      setShowAddPasskey(false)
      setPasskeyName('')
      setSuccess(t('security.passkeys.added'))
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: Error) => {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    },
  })

  const deletePasskeyMutation = useMutation({
    mutationFn: async (passkeyId: string) => {
      await deletePasskey({ data: { passkeyId } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      setSuccess(t('security.passkeys.deleted'))
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: Error) => {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    },
  })

  const renamePasskeyMutation = useMutation({
    mutationFn: async ({ passkeyId, name }: { passkeyId: string; name: string }) => {
      await renamePasskey({ data: { passkeyId, name } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      setEditingPasskey(null)
      setEditName('')
    },
    onError: (err: Error) => {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    },
  })

  const passkeys = passkeysData?.passkeys || []

  const formatDate = (date: Date | string | null) => {
    if (!date) return t('common.never')
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
          {t('security.title')}
        </h2>
        <p className="text-sm" style={{ color: colors.foregroundMuted }}>
          {t('security.description')}
        </p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-400">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passkeys Section */}
      <section
        className="rounded-2xl p-6"
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(colors.primary)}, 0.1)` }}
            >
              <Fingerprint className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.foreground }}>
                {t('security.passkeys.title')}
              </h3>
              <p className="text-xs" style={{ color: colors.foregroundMuted }}>
                {t('security.passkeys.description')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddPasskey(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{
              background: colors.primary,
              color: 'white',
            }}
          >
            <Plus className="w-4 h-4" />
            {t('security.passkeys.add')}
          </button>
        </div>

        {/* Add Passkey Modal */}
        <AnimatePresence>
          {showAddPasskey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl overflow-hidden"
              style={{
                background: colors.backgroundSecondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                <h4 className="font-medium" style={{ color: colors.foreground }}>
                  {t('security.passkeys.addNew')}
                </h4>
              </div>
              <input
                type="text"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder={t('security.passkeys.namePlaceholder')}
                className="w-full px-4 py-3 rounded-lg mb-4 outline-none"
                style={{
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                  color: colors.foreground,
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => addPasskeyMutation.mutate()}
                  disabled={addPasskeyMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: colors.primary, color: 'white' }}
                >
                  {addPasskeyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Fingerprint className="w-4 h-4" />
                  )}
                  {t('security.passkeys.register')}
                </button>
                <button
                  onClick={() => {
                    setShowAddPasskey(false)
                    setPasskeyName('')
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: colors.backgroundSecondary,
                    border: `1px solid ${colors.border}`,
                    color: colors.foreground,
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Passkeys List */}
        {passkeysLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.foregroundMuted }} />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 mx-auto mb-3" style={{ color: colors.foregroundMuted }} />
            <p className="text-sm" style={{ color: colors.foregroundMuted }}>
              {t('security.passkeys.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((passkey) => (
              <motion.div
                key={passkey.id}
                layout
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: colors.backgroundSecondary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `rgba(${hexToRgb(colors.accent)}, 0.1)` }}
                  >
                    {passkey.deviceType === 'platform' ? (
                      <Monitor className="w-5 h-5" style={{ color: colors.accent }} />
                    ) : (
                      <Smartphone className="w-5 h-5" style={{ color: colors.accent }} />
                    )}
                  </div>
                  <div>
                    {editingPasskey === passkey.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 rounded text-sm outline-none"
                          style={{
                            background: colors.background,
                            border: `1px solid ${colors.border}`,
                            color: colors.foreground,
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => renamePasskeyMutation.mutate({ passkeyId: passkey.id, name: editName })}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPasskey(null)
                            setEditName('')
                          }}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <p className="font-medium" style={{ color: colors.foreground }}>
                        {passkey.name}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: colors.foregroundMuted }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('security.passkeys.created')}: {formatDate(passkey.createdAt)}
                      </span>
                      {passkey.lastUsedAt && (
                        <span>
                          {t('security.passkeys.lastUsed')}: {formatDate(passkey.lastUsedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingPasskey(passkey.id)
                      setEditName(passkey.name)
                    }}
                    className="p-2 rounded-lg transition-all hover:bg-white/10"
                    style={{ color: colors.foregroundMuted }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePasskeyMutation.mutate(passkey.id)}
                    disabled={deletePasskeyMutation.isPending}
                    className="p-2 rounded-lg transition-all hover:bg-red-500/10 text-red-400"
                  >
                    {deletePasskeyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* OTP Login Section */}
      <section
        className="rounded-2xl p-6"
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `rgba(${hexToRgb(colors.accent)}, 0.1)` }}
          >
            <Mail className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: colors.foreground }}>
              {t('security.otp.title')}
            </h3>
            <p className="text-xs" style={{ color: colors.foregroundMuted }}>
              {t('security.otp.description')}
            </p>
          </div>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            background: colors.backgroundSecondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium" style={{ color: colors.foreground }}>
                {t('security.otp.enabled')}
              </p>
              <p className="text-xs" style={{ color: colors.foregroundMuted }}>
                {t('security.otp.enabledDescription', { email: currentUser.email })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, rgba(${hexToRgb(colors.primary)}, 0.1), rgba(${hexToRgb(colors.accent)}, 0.05))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.foreground }}>
          {t('security.tips.title')}
        </h3>
        <ul className="space-y-3">
          {['passkey', 'unique', 'phishing'].map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: colors.primary }} />
              <span className="text-sm" style={{ color: colors.foregroundMuted }}>
                {t(`security.tips.${tip}`)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
