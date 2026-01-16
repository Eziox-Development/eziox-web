import { useState } from 'react'
import { motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { submitPartnerApplicationFn } from '@/server/functions/partners'
import {
  CATEGORIES, FEATURED_CATEGORIES, OTHER_CATEGORIES,
  STREAMING_PLATFORMS, FOLLOWER_RANGES, TOP_GAMES, GAME_PLATFORMS,
  DEVELOPER_TYPES, PROGRAMMING_LANGUAGES, GAME_ENGINES,
  ARTIST_TYPES, MUSICIAN_TYPES, MUSIC_PLATFORMS, CONTENT_TYPES,
  VTUBER_MODEL_TYPES,
  type CategoryId,
} from '@/lib/partner-categories'
import {
  Handshake, Loader2, Send, Building2, Globe, X, ChevronDown,
  Tv, Gamepad2, Code, Palette,
} from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

type CategoryDataType = {
  platform?: string
  platformUrl?: string
  followerRange?: string
  contentTypes?: string[]
  modelType?: string
  mainGamerTag?: string
  games?: string[]
  gamePlatforms?: Record<string, string>
  developerType?: string
  languages?: string[]
  gameEngine?: string
  artistType?: string
  portfolioUrl?: string
  musicianType?: string
  musicPlatforms?: Record<string, string>
  genres?: string[]
}

export function PartnerApplicationForm({ onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const submitApplication = useServerFn(submitPartnerApplicationFn)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    category: '' as CategoryId | '',
    subcategory: '',
    categoryData: {} as CategoryDataType,
    audienceSize: '',
    description: '',
    whyPartner: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const submitMutation = useMutation({
    mutationFn: (data: Parameters<typeof submitApplication>[0]) => submitApplication(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-partner-application'] })
      onSuccess()
    },
    onError: (error: Error) => {
      setFormError(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.category) {
      setFormError('Please select a category')
      return
    }
    if (formData.description.length < 50) {
      setFormError('Description must be at least 50 characters')
      return
    }
    if (formData.whyPartner.length < 50) {
      setFormError('Please explain why you want to partner (at least 50 characters)')
      return
    }

    submitMutation.mutate({
      data: {
        companyName: formData.companyName || undefined,
        website: formData.website || undefined,
        category: formData.category as CategoryId,
        subcategory: formData.subcategory || undefined,
        categoryData: formData.categoryData,
        audienceSize: formData.audienceSize as 'micro' | 'small' | 'medium' | 'large' | 'mega' | 'celebrity' | undefined,
        description: formData.description,
        whyPartner: formData.whyPartner,
      },
    })
  }

  const updateCategoryData = (key: string, value: string | string[] | Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      categoryData: { ...prev.categoryData, [key]: value },
    }))
  }

  const selectedCategory = CATEGORIES.find(c => c.id === formData.category)

  const renderCategoryFields = () => {
    if (!formData.category) return null

    switch (formData.category) {
      case 'streamer':
      case 'content_creator':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Main Platform <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STREAMING_PLATFORMS.slice(0, 6).map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => updateCategoryData('platform', platform.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.platform === platform.id ? `${platform.color}20` : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.platform === platform.id ? platform.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.platform === platform.id ? platform.color : 'var(--foreground-muted)',
                    }}
                  >
                    <Tv size={14} />
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.categoryData.platform && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Channel/Profile URL
                </label>
                <input
                  type="url"
                  value={formData.categoryData.platformUrl || ''}
                  onChange={(e) => updateCategoryData('platformUrl', e.target.value)}
                  placeholder={STREAMING_PLATFORMS.find(p => p.id === formData.categoryData.platform)?.urlPrefix + '...'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Follower Count
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLLOWER_RANGES.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => updateCategoryData('followerRange', range.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.followerRange === range.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.followerRange === range.id ? '#14b8a6' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.followerRange === range.id ? '#14b8a6' : 'var(--foreground-muted)',
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.category === 'content_creator' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        const current = formData.categoryData.contentTypes || []
                        const updated = current.includes(type.id)
                          ? current.filter(t => t !== type.id)
                          : [...current, type.id]
                        updateCategoryData('contentTypes', updated)
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: formData.categoryData.contentTypes?.includes(type.id) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${formData.categoryData.contentTypes?.includes(type.id) ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formData.categoryData.contentTypes?.includes(type.id) ? '#8b5cf6' : 'var(--foreground-muted)',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'vtuber':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Model Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {VTUBER_MODEL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateCategoryData('modelType', type.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.modelType === type.id ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.modelType === type.id ? '#FF6B9D' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.modelType === type.id ? '#FF6B9D' : 'var(--foreground-muted)',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Main Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STREAMING_PLATFORMS.slice(0, 4).map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => updateCategoryData('platform', platform.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.platform === platform.id ? `${platform.color}20` : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.platform === platform.id ? platform.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.platform === platform.id ? platform.color : 'var(--foreground-muted)',
                    }}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Follower Count
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLLOWER_RANGES.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => updateCategoryData('followerRange', range.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.followerRange === range.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.followerRange === range.id ? '#14b8a6' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.followerRange === range.id ? '#14b8a6' : 'var(--foreground-muted)',
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'gamer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Main Gamer Tag <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Gamepad2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  type="text"
                  value={formData.categoryData.mainGamerTag || ''}
                  onChange={(e) => updateCategoryData('mainGamerTag', e.target.value)}
                  placeholder="Your main gaming username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Games You Play <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="max-h-48 overflow-y-auto rounded-xl p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex flex-wrap gap-2">
                  {TOP_GAMES.slice(0, 30).map((game) => (
                    <button
                      key={game}
                      type="button"
                      onClick={() => {
                        const current = formData.categoryData.games || []
                        const updated = current.includes(game)
                          ? current.filter(g => g !== game)
                          : [...current, game]
                        updateCategoryData('games', updated)
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: formData.categoryData.games?.includes(game) ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${formData.categoryData.games?.includes(game) ? '#00D4AA' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formData.categoryData.games?.includes(game) ? '#00D4AA' : 'var(--foreground-muted)',
                      }}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                Selected: {formData.categoryData.games?.length || 0} games
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Gaming Platforms
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GAME_PLATFORMS.slice(0, 6).map((platform) => (
                  <div key={platform.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={(formData.categoryData.gamePlatforms as Record<string, string>)?.[platform.id] || ''}
                      onChange={(e) => {
                        const current = (formData.categoryData.gamePlatforms as Record<string, string>) || {}
                        updateCategoryData('gamePlatforms', { ...current, [platform.id]: e.target.value })
                      }}
                      placeholder={`${platform.label}: ${platform.placeholder}`}
                      className="flex-1 px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'developer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Developer Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEVELOPER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateCategoryData('developerType', type.id)}
                    className="flex flex-col items-start p-3 rounded-xl text-left transition-all"
                    style={{
                      background: formData.categoryData.developerType === type.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.developerType === type.id ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)'}`,
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: formData.categoryData.developerType === type.id ? '#3B82F6' : 'var(--foreground)' }}>
                      {type.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Programming Languages <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PROGRAMMING_LANGUAGES.slice(0, 15).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      const current = formData.categoryData.languages || []
                      const updated = current.includes(lang)
                        ? current.filter(l => l !== lang)
                        : [...current, lang]
                      updateCategoryData('languages', updated)
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.languages?.includes(lang) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.languages?.includes(lang) ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.languages?.includes(lang) ? '#3B82F6' : 'var(--foreground-muted)',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Portfolio / GitHub
              </label>
              <div className="relative">
                <Code size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  type="url"
                  value={formData.categoryData.portfolioUrl || ''}
                  onChange={(e) => updateCategoryData('portfolioUrl', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
              </div>
            </div>
          </div>
        )

      case 'game_creator':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Game Engine <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GAME_ENGINES.map((engine) => (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => updateCategoryData('gameEngine', engine)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.gameEngine === engine ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.gameEngine === engine ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.gameEngine === engine ? '#F59E0B' : 'var(--foreground-muted)',
                    }}
                  >
                    {engine}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Programming Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {['C#', 'C++', 'GDScript', 'Lua', 'JavaScript', 'Python'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      const current = formData.categoryData.languages || []
                      const updated = current.includes(lang)
                        ? current.filter(l => l !== lang)
                        : [...current, lang]
                      updateCategoryData('languages', updated)
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.languages?.includes(lang) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.languages?.includes(lang) ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.languages?.includes(lang) ? '#F59E0B' : 'var(--foreground-muted)',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Portfolio / itch.io
              </label>
              <input
                type="url"
                value={formData.categoryData.portfolioUrl || ''}
                onChange={(e) => updateCategoryData('portfolioUrl', e.target.value)}
                placeholder="https://itch.io/profile/username"
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        )

      case 'artist':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Art Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ARTIST_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateCategoryData('artistType', type.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.artistType === type.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.artistType === type.id ? '#EC4899' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.artistType === type.id ? '#EC4899' : 'var(--foreground-muted)',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Portfolio URL
              </label>
              <div className="relative">
                <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                <input
                  type="url"
                  value={formData.categoryData.portfolioUrl || ''}
                  onChange={(e) => updateCategoryData('portfolioUrl', e.target.value)}
                  placeholder="https://artstation.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
              </div>
            </div>
          </div>
        )

      case 'musician':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Musician Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSICIAN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateCategoryData('musicianType', type.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formData.categoryData.musicianType === type.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.categoryData.musicianType === type.id ? '#8B5CF6' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.categoryData.musicianType === type.id ? '#8B5CF6' : 'var(--foreground-muted)',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Music Platforms
              </label>
              <div className="space-y-2">
                {MUSIC_PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex items-center gap-2">
                    <span className="text-xs w-24" style={{ color: 'var(--foreground-muted)' }}>{platform.label}</span>
                    <input
                      type="url"
                      value={(formData.categoryData.musicPlatforms as Record<string, string>)?.[platform.id] || ''}
                      onChange={(e) => {
                        const current = (formData.categoryData.musicPlatforms as Record<string, string>) || {}
                        updateCategoryData('musicPlatforms', { ...current, [platform.id]: e.target.value })
                      }}
                      placeholder={platform.urlPrefix + platform.placeholder}
                      className="flex-1 px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-6 pb-4" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)' }}>
                <Handshake size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Partner Application</h2>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Step {step} of 3 - {step === 1 ? 'Category' : step === 2 ? 'Details' : 'About You'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <X size={20} style={{ color: 'var(--foreground-muted)' }} />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: s <= step ? 'linear-gradient(90deg, #14b8a6, #8b5cf6)' : 'rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Featured Categories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FEATURED_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id, categoryData: {} })}
                        className="relative p-4 rounded-2xl text-left transition-all group overflow-hidden"
                        style={{
                          background: formData.category === cat.id ? `${cat.color}15` : 'rgba(255, 255, 255, 0.02)',
                          border: `2px solid ${formData.category === cat.id ? cat.color : 'rgba(255, 255, 255, 0.08)'}`,
                        }}
                      >
                        <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[10px] font-bold" style={{ background: cat.color, color: 'white' }}>
                          FEATURED
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}>
                          <Icon size={20} style={{ color: cat.color }} />
                        </div>
                        <h4 className="font-semibold mb-1" style={{ color: formData.category === cat.id ? cat.color : 'var(--foreground)' }}>
                          {cat.label}
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{cat.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Other Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OTHER_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id, categoryData: {} })}
                        className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: formData.category === cat.id ? `${cat.color}15` : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${formData.category === cat.id ? cat.color : 'rgba(255, 255, 255, 0.08)'}`,
                        }}
                      >
                        <Icon size={16} style={{ color: formData.category === cat.id ? cat.color : 'var(--foreground-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: formData.category === cat.id ? cat.color : 'var(--foreground)' }}>
                          {cat.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {selectedCategory && (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${selectedCategory.color}10`, border: `1px solid ${selectedCategory.color}30` }}>
                  <selectedCategory.icon size={24} style={{ color: selectedCategory.color }} />
                  <div>
                    <h3 className="font-semibold" style={{ color: selectedCategory.color }}>{selectedCategory.label}</h3>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{selectedCategory.description}</p>
                  </div>
                </div>
              )}

              {renderCategoryFields()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Company/Brand Name <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your company name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Website <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  About You/Your Brand <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about yourself, your content, and your audience..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {formData.description.length}/2000 characters (min 50)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Why Partner With Us? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={formData.whyPartner}
                  onChange={(e) => setFormData({ ...formData, whyPartner: e.target.value })}
                  placeholder="What do you hope to achieve through this partnership?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {formData.whyPartner.length}/2000 characters (min 50)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Audience Size <span style={{ color: 'var(--foreground-muted)' }}>(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLLOWER_RANGES.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, audienceSize: range.id })}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: formData.audienceSize === range.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${formData.audienceSize === range.id ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formData.audienceSize === range.id ? '#8b5cf6' : 'var(--foreground-muted)',
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formError && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-sm" style={{ color: '#ef4444' }}>{formError}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--foreground)' }}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <motion.button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.category) {
                    setFormError('Please select a category')
                    return
                  }
                  setFormError(null)
                  setStep(step + 1)
                }}
                className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
                <ChevronDown size={16} className="-rotate-90" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', color: 'white', opacity: submitMutation.isPending ? 0.7 : 1 }}
                whileHover={{ scale: submitMutation.isPending ? 1 : 1.02 }}
                whileTap={{ scale: submitMutation.isPending ? 1 : 0.98 }}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Application
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
