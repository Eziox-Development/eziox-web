import { motion } from 'motion/react'
import { Lock, Eye, Activity, Crown, Zap, Users, Settings } from 'lucide-react'
import type { ProfileFormData } from '@/components/profile/types'
import { useTheme } from '@/components/layout/ThemeProvider'

interface PrivacyTabProps {
  formData: ProfileFormData
  updateField: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void
  isOwner: boolean
}

export function PrivacyTab({ formData, updateField, isOwner }: PrivacyTabProps) {
  const { theme } = useTheme()
  const accentColor = theme.colors.primary
  return (
    <motion.div key="privacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Privacy Settings */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Lock size={20} style={{ color: accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Privacy Settings</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <ToggleField
            label="Public Profile"
            description="Allow others to see your profile and bio page"
            icon={Eye}
            checked={formData.isPublic}
            onChange={(v) => updateField('isPublic', v)}
            accentColor={accentColor}
          />
          <ToggleField
            label="Show Activity"
            description="Display your activity status to other users"
            icon={Activity}
            checked={formData.showActivity}
            onChange={(v) => updateField('showActivity', v)}
            accentColor={accentColor}
          />
        </div>
      </div>

      {/* Owner Section */}
      {isOwner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown size={20} style={{ color: '#f59e0b' }} />
            <h3 className="font-bold" style={{ color: '#f59e0b' }}>Owner Privileges</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Full Access', description: 'All platform features', icon: Zap },
              { label: 'User Management', description: 'Manage all users', icon: Users },
              { label: 'Site Settings', description: 'Full control', icon: Settings },
            ].map((priv) => (
              <div key={priv.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--card)' }}>
                <priv.icon size={18} style={{ color: '#f59e0b' }} />
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{priv.label}</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{priv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function ToggleField({ label, description, icon: Icon, checked, onChange, accentColor }: {
  label: string; description: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; checked: boolean; onChange: (v: boolean) => void; accentColor: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--card)' }}>
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-7 rounded-full transition-colors"
        style={{ background: checked ? accentColor : 'var(--border)' }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white"
          animate={{ left: checked ? 26 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
