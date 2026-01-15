import { motion } from 'motion/react'
import { User, AtSign, MapPin, Globe, Cake, Pencil } from 'lucide-react'
import { SOCIAL_PLATFORMS, CREATOR_TYPES, PRONOUNS_OPTIONS, type ProfileFormData } from '@/routes/_protected/profile'

interface ProfileTabProps {
  formData: ProfileFormData
  updateField: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void
  updateSocial: (key: string, value: string) => void
  customPronouns: string
  setCustomPronouns: (v: string) => void
}

export function ProfileTab({ formData, updateField, updateSocial, customPronouns, setCustomPronouns }: ProfileTabProps) {
  return (
    <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <User size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Basic Information</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <InputField label="Display Name" icon={User} value={formData.name} onChange={(v) => updateField('name', v)} placeholder="Your name" />
          <InputField label="Username" icon={AtSign} value={formData.username} onChange={(v) => updateField('username', v.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="username" hint={`eziox.link/${formData.username || 'username'}`} />
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Bio</label>
            <div className="relative">
              <Pencil size={18} className="absolute left-3 top-3" style={{ color: 'var(--foreground-muted)' }} />
              <textarea value={formData.bio} onChange={(e) => updateField('bio', e.target.value)} rows={3} maxLength={500}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none resize-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} placeholder="Tell the world about yourself..." />
            </div>
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--foreground-muted)' }}>{formData.bio.length}/500</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Location" icon={MapPin} value={formData.location} onChange={(v) => updateField('location', v)} placeholder="City, Country" />
            <InputField label="Website" icon={Globe} value={formData.website} onChange={(v) => updateField('website', v)} placeholder="https://..." type="url" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Pronouns" value={formData.pronouns} onChange={(v) => updateField('pronouns', v)} options={PRONOUNS_OPTIONS} />
            <InputField label="Birthday" icon={Cake} value={formData.birthday} onChange={(v) => updateField('birthday', v)} type="date" />
          </div>

          {formData.pronouns === 'custom' && (
            <InputField label="Custom Pronouns" value={customPronouns} onChange={setCustomPronouns} placeholder="Enter pronouns" />
          )}

          <SelectField label="Creator Type" value={formData.creatorType} onChange={(v) => updateField('creatorType', v)} options={CREATOR_TYPES} hint="Helps show your profile to the right audience" />
        </div>
      </div>

      {/* Socials */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Globe size={20} style={{ color: formData.accentColor }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Social Links</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.key} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: p.color + '20' }}>
                <p.icon size={20} style={{ color: p.color }} />
              </div>
              <input type="text" value={formData.socials[p.key] || ''} onChange={(e) => updateSocial(p.key, e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl outline-none" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} placeholder={p.placeholder} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function InputField({ label, icon: Icon, value, onChange, placeholder, type = 'text', hint }: {
  label: string; icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl outline-none`} style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{hint}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer" style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{hint}</p>}
    </div>
  )
}
