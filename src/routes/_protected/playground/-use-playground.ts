import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  getProfileSettingsFn,
  updateCustomBackgroundFn,
  updateLayoutSettingsFn,
  createProfileBackupFn,
  restoreProfileBackupFn,
  deleteProfileBackupFn,
  updateIntroGateFn,
  updateProfileMusicFn,
  getIntroGateAndMusicFn,
  updateNameEffectFn,
  updateStatusTextFn,
  updateCustomCursorFn,
  updateProfileEffectsFn,
  getAdvancedProfileSettingsFn,
} from '@/server/functions/profile-settings'
import {
  getCreatorSettingsFn,
  updateCustomCSSFn,
  addCustomFontFn,
  removeCustomFontFn,
  updateAnimatedProfileFn,
} from '@/server/functions/creator-features'
import { uploadCursorFn, getUploadSignatureFn, uploadFontFn } from '@/server/functions/upload'
import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  IntroGateSettings,
  ProfileMusicSettings,
  NameEffect,
  StatusText,
  CustomCursor,
  ProfileEffects,
} from './-types'
import {
  DEFAULT_LAYOUT,
  DEFAULT_ANIMATED,
  DEFAULT_INTRO_GATE,
  DEFAULT_MUSIC,
  DEFAULT_NAME_EFFECT,
  DEFAULT_STATUS_TEXT,
  DEFAULT_CURSOR,
  DEFAULT_EFFECTS,
} from './-types'

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  const ka = Object.keys(a as object).sort()
  const kb = Object.keys(b as object).sort()
  if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) return false
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

export function usePlaygroundQueries() {
  const getSettings = useServerFn(getProfileSettingsFn)
  const getCreatorSettings = useServerFn(getCreatorSettingsFn)
  const getIntroGateAndMusic = useServerFn(getIntroGateAndMusicFn)
  const getAdvancedSettings = useServerFn(getAdvancedProfileSettingsFn)

  const profileSettings = useQuery({
    queryKey: ['profileSettings'],
    queryFn: () => getSettings(),
  })

  const creatorSettings = useQuery({
    queryKey: ['creatorSettings'],
    queryFn: () => getCreatorSettings(),
  })

  const gateAndMusic = useQuery({
    queryKey: ['introGateAndMusic'],
    queryFn: () => getIntroGateAndMusic(),
  })

  const advancedSettings = useQuery({
    queryKey: ['advancedProfileSettings'],
    queryFn: () => getAdvancedSettings(),
  })

  return { profileSettings, creatorSettings, gateAndMusic, advancedSettings }
}

export function usePlaygroundPermissions() {
  const { currentUser } = useAuth()
  const { creatorSettings } = usePlaygroundQueries()

  const userTier = (currentUser?.tier || 'free') as string
  const isPremium = ['pro', 'creator', 'lifetime'].includes(userTier)
  const isCreator =
    creatorSettings.data?.isCreator || ['creator', 'lifetime'].includes(userTier)

  return { currentUser, userTier, isPremium, isCreator }
}

// --- Background ---
export function useBackgroundState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { profileSettings } = usePlaygroundQueries()
  const updateBackground = useServerFn(updateCustomBackgroundFn)
  const getUploadSignature = useServerFn(getUploadSignatureFn)

  const [localBackground, setLocalBackground] = useState<CustomBackground | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [animatedCategory, setAnimatedCategory] = useState<string>('all')
  const savedBgRef = useRef<CustomBackground | null>(null)

  useEffect(() => {
    if (profileSettings.data?.customBackground) {
      savedBgRef.current = profileSettings.data.customBackground
      setLocalBackground(profileSettings.data.customBackground)
    }
  }, [profileSettings.data])

  const isDirty = !deepEqual(localBackground, savedBgRef.current)
  const resetBackground = () => setLocalBackground(savedBgRef.current)

  const mutation = useMutation({
    mutationFn: (bg: CustomBackground | null) => updateBackground({ data: bg }),
    onSuccess: (_, bg) => {
      toast.success(t('playground.saved'))
      savedBgRef.current = bg
      setLocalBackground(bg)
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  return {
    localBackground,
    setLocalBackground,
    videoUploading,
    setVideoUploading,
    animatedCategory,
    setAnimatedCategory,
    isDirty,
    resetBackground,
    mutation,
    getUploadSignature,
  }
}

// --- Layout ---
export function useLayoutState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { profileSettings } = usePlaygroundQueries()
  const updateLayout = useServerFn(updateLayoutSettingsFn)

  const [localLayout, setLocalLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT)
  const savedLayoutRef = useRef<LayoutSettings>(DEFAULT_LAYOUT)

  useEffect(() => {
    if (profileSettings.data?.layoutSettings) {
      savedLayoutRef.current = profileSettings.data.layoutSettings
      setLocalLayout(profileSettings.data.layoutSettings)
    }
  }, [profileSettings.data])

  const isDirty = !deepEqual(localLayout, savedLayoutRef.current)
  const resetLayout = () => setLocalLayout(savedLayoutRef.current)

  const mutation = useMutation({
    mutationFn: (l: Partial<LayoutSettings>) => updateLayout({ data: l }),
    onSuccess: (_, l) => {
      toast.success(t('playground.saved'))
      const merged = { ...savedLayoutRef.current, ...l }
      savedLayoutRef.current = merged
      setLocalLayout(merged)
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  return { localLayout, setLocalLayout, isDirty, resetLayout, mutation }
}

// --- Animations ---
export function useAnimationsState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { creatorSettings } = usePlaygroundQueries()
  const updateAnimated = useServerFn(updateAnimatedProfileFn)

  const [localAnimated, setLocalAnimated] = useState<AnimatedProfileSettings>(DEFAULT_ANIMATED)
  const savedAnimRef = useRef<AnimatedProfileSettings>(DEFAULT_ANIMATED)

  useEffect(() => {
    if (creatorSettings.data?.animatedProfile) {
      savedAnimRef.current = creatorSettings.data.animatedProfile
      setLocalAnimated(creatorSettings.data.animatedProfile)
    }
  }, [creatorSettings.data])

  const isDirty = !deepEqual(localAnimated, savedAnimRef.current)
  const resetAnimated = () => setLocalAnimated(savedAnimRef.current)

  const mutation = useMutation({
    mutationFn: (a: AnimatedProfileSettings) => updateAnimated({ data: a }),
    onSuccess: (_, a) => {
      toast.success(t('playground.saved'))
      savedAnimRef.current = a
      setLocalAnimated(a)
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  return { localAnimated, setLocalAnimated, isDirty, resetAnimated, mutation }
}

// --- Fonts ---
export function useFontsState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { creatorSettings } = usePlaygroundQueries()
  const addFont = useServerFn(addCustomFontFn)
  const removeFont = useServerFn(removeCustomFontFn)
  const uploadFont = useServerFn(uploadFontFn)

  const [newFontName, setNewFontName] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontType, setNewFontType] = useState<'display' | 'body'>('display')
  const [fontCategory, setFontCategory] = useState<string>('all')
  const [fontUploading, setFontUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  const fontMutation = useMutation({
    mutationFn: (f: { name: string; url: string; type: 'display' | 'body' }) =>
      addFont({ data: { ...f, id: crypto.randomUUID() } }),
    onSuccess: () => {
      toast.success(t('playground.fontAdded'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
      setNewFontName('')
      setNewFontUrl('')
      setUploadedFileName('')
    },
  })

  const removeFontMutation = useMutation({
    mutationFn: (id: string) => removeFont({ data: { fontId: id } }),
    onSuccess: () => {
      toast.success(t('playground.fontRemoved'))
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  return {
    customFonts: creatorSettings.data?.customFonts,
    newFontName,
    setNewFontName,
    newFontUrl,
    setNewFontUrl,
    newFontType,
    setNewFontType,
    fontCategory,
    setFontCategory,
    fontUploading,
    setFontUploading,
    uploadedFileName,
    setUploadedFileName,
    fontMutation,
    removeFontMutation,
    uploadFont,
  }
}

// --- CSS ---
export function useCSSState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { creatorSettings } = usePlaygroundQueries()
  const updateCSS = useServerFn(updateCustomCSSFn)

  const [cssInput, setCssInput] = useState('')
  const savedCSSRef = useRef('')

  useEffect(() => {
    if (creatorSettings.data?.customCSS != null) {
      savedCSSRef.current = creatorSettings.data.customCSS
      setCssInput(creatorSettings.data.customCSS)
    }
  }, [creatorSettings.data])

  const isDirty = cssInput !== savedCSSRef.current
  const resetCSS = () => setCssInput(savedCSSRef.current)

  const mutation = useMutation({
    mutationFn: (css: string) => updateCSS({ data: { css } }),
    onSuccess: (_, css) => {
      toast.success(t('playground.saved'))
      savedCSSRef.current = css
      setCssInput(css)
      void queryClient.invalidateQueries({ queryKey: ['creatorSettings'] })
    },
  })

  return { cssInput, setCssInput, isDirty, resetCSS, mutation }
}

// --- Intro Gate ---
export function useIntroGateState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { gateAndMusic } = usePlaygroundQueries()
  const updateIntroGate = useServerFn(updateIntroGateFn)

  const [localIntroGate, setLocalIntroGate] = useState<IntroGateSettings>(DEFAULT_INTRO_GATE)
  const savedGateRef = useRef<IntroGateSettings>(DEFAULT_INTRO_GATE)

  useEffect(() => {
    if (gateAndMusic.data?.introGate) {
      savedGateRef.current = gateAndMusic.data.introGate
      setLocalIntroGate(gateAndMusic.data.introGate)
    }
  }, [gateAndMusic.data])

  const isDirty = !deepEqual(localIntroGate, savedGateRef.current)
  const resetIntroGate = () => setLocalIntroGate(savedGateRef.current)

  const mutation = useMutation({
    mutationFn: (gate: IntroGateSettings) => updateIntroGate({ data: gate }),
    onSuccess: (_, gate) => {
      toast.success(t('playground.saved'))
      savedGateRef.current = gate
      setLocalIntroGate(gate)
      void queryClient.invalidateQueries({ queryKey: ['introGateAndMusic'] })
    },
  })

  return { localIntroGate, setLocalIntroGate, isDirty, resetIntroGate, mutation }
}

// --- Music ---
export function useMusicState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { gateAndMusic } = usePlaygroundQueries()
  const updateProfileMusic = useServerFn(updateProfileMusicFn)

  const [localMusic, setLocalMusic] = useState<ProfileMusicSettings>(DEFAULT_MUSIC)
  const savedMusicRef = useRef<ProfileMusicSettings>(DEFAULT_MUSIC)

  useEffect(() => {
    if (gateAndMusic.data?.profileMusic) {
      savedMusicRef.current = gateAndMusic.data.profileMusic
      setLocalMusic(gateAndMusic.data.profileMusic)
    }
  }, [gateAndMusic.data])

  const isDirty = !deepEqual(localMusic, savedMusicRef.current)
  const resetMusic = () => setLocalMusic(savedMusicRef.current)

  const mutation = useMutation({
    mutationFn: (music: ProfileMusicSettings) => updateProfileMusic({ data: music }),
    onSuccess: (_, music) => {
      toast.success(t('playground.saved'))
      savedMusicRef.current = music
      setLocalMusic(music)
      void queryClient.invalidateQueries({ queryKey: ['introGateAndMusic'] })
    },
  })

  return { localMusic, setLocalMusic, isDirty, resetMusic, mutation }
}

// --- Name Effects ---
export function useNameEffectState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { advancedSettings } = usePlaygroundQueries()
  const updateNameEffect = useServerFn(updateNameEffectFn)

  const [localNameEffect, setLocalNameEffect] = useState<NameEffect>(DEFAULT_NAME_EFFECT)
  const savedRef = useRef<NameEffect>(DEFAULT_NAME_EFFECT)

  useEffect(() => {
    if (advancedSettings.data?.nameEffect) {
      savedRef.current = advancedSettings.data.nameEffect
      setLocalNameEffect(advancedSettings.data.nameEffect)
    }
  }, [advancedSettings.data])

  const isDirty = !deepEqual(localNameEffect, savedRef.current)
  const resetNameEffect = () => setLocalNameEffect(savedRef.current)

  const mutation = useMutation({
    mutationFn: (ne: NameEffect) => updateNameEffect({ data: ne }),
    onSuccess: (_, ne) => {
      toast.success(t('playground.saved'))
      savedRef.current = ne
      setLocalNameEffect(ne)
      void queryClient.invalidateQueries({ queryKey: ['advancedProfileSettings'] })
    },
  })

  return { localNameEffect, setLocalNameEffect, isDirty, resetNameEffect, mutation }
}

// --- Status Text ---
export function useStatusTextState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { advancedSettings } = usePlaygroundQueries()
  const updateStatusText = useServerFn(updateStatusTextFn)

  const [localStatusText, setLocalStatusText] = useState<StatusText>(DEFAULT_STATUS_TEXT)
  const savedSTRef = useRef<StatusText>(DEFAULT_STATUS_TEXT)

  useEffect(() => {
    if (advancedSettings.data?.statusText) {
      savedSTRef.current = advancedSettings.data.statusText
      setLocalStatusText(advancedSettings.data.statusText)
    }
  }, [advancedSettings.data])

  const isDirty = !deepEqual(localStatusText, savedSTRef.current)
  const resetStatusText = () => setLocalStatusText(savedSTRef.current)

  const mutation = useMutation({
    mutationFn: (st: StatusText) => updateStatusText({ data: st }),
    onSuccess: (_, st) => {
      toast.success(t('playground.saved'))
      savedSTRef.current = st
      setLocalStatusText(st)
      void queryClient.invalidateQueries({ queryKey: ['advancedProfileSettings'] })
    },
  })

  return { localStatusText, setLocalStatusText, isDirty, resetStatusText, mutation }
}

// --- Custom Cursor ---
export function useCursorState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { advancedSettings } = usePlaygroundQueries()
  const updateCustomCursor = useServerFn(updateCustomCursorFn)
  const uploadCursor = useServerFn(uploadCursorFn)

  const [localCursor, setLocalCursor] = useState<CustomCursor>(DEFAULT_CURSOR)
  const [cursorUploading, setCursorUploading] = useState(false)
  const savedCursorRef = useRef<CustomCursor>(DEFAULT_CURSOR)

  useEffect(() => {
    if (advancedSettings.data?.customCursor) {
      savedCursorRef.current = advancedSettings.data.customCursor
      setLocalCursor(advancedSettings.data.customCursor)
    }
  }, [advancedSettings.data])

  const isDirty = !deepEqual(localCursor, savedCursorRef.current)
  const resetCursor = () => setLocalCursor(savedCursorRef.current)

  const mutation = useMutation({
    mutationFn: (c: CustomCursor) => updateCustomCursor({ data: c }),
    onSuccess: (_, c) => {
      toast.success(t('playground.saved'))
      savedCursorRef.current = c
      setLocalCursor(c)
      void queryClient.invalidateQueries({ queryKey: ['advancedProfileSettings'] })
    },
  })

  return {
    localCursor,
    setLocalCursor,
    cursorUploading,
    setCursorUploading,
    isDirty,
    resetCursor,
    mutation,
    uploadCursor,
  }
}

// --- Profile Effects ---
export function useEffectsState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { advancedSettings } = usePlaygroundQueries()
  const updateProfileEffects = useServerFn(updateProfileEffectsFn)

  const [localEffects, setLocalEffects] = useState<ProfileEffects>(DEFAULT_EFFECTS)
  const savedFxRef = useRef<ProfileEffects>(DEFAULT_EFFECTS)

  useEffect(() => {
    if (advancedSettings.data?.profileEffects) {
      savedFxRef.current = advancedSettings.data.profileEffects
      setLocalEffects(advancedSettings.data.profileEffects)
    }
  }, [advancedSettings.data])

  const isDirty = !deepEqual(localEffects, savedFxRef.current)
  const resetEffects = () => setLocalEffects(savedFxRef.current)

  const mutation = useMutation({
    mutationFn: (e: ProfileEffects) => updateProfileEffects({ data: e }),
    onSuccess: (_, e) => {
      toast.success(t('playground.saved'))
      savedFxRef.current = e
      setLocalEffects(e)
      void queryClient.invalidateQueries({ queryKey: ['advancedProfileSettings'] })
    },
  })

  return { localEffects, setLocalEffects, isDirty, resetEffects, mutation }
}

// --- Backups ---
export function useBackupsState() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { profileSettings } = usePlaygroundQueries()
  const createBackup = useServerFn(createProfileBackupFn)
  const restoreBackup = useServerFn(restoreProfileBackupFn)
  const deleteBackup = useServerFn(deleteProfileBackupFn)

  const [backupName, setBackupName] = useState('')

  const backupMutation = useMutation({
    mutationFn: (name: string) => createBackup({ data: { name } }),
    onSuccess: () => {
      toast.success(t('playground.backupCreated'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
      setBackupName('')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreBackup({ data: { backupId: id } }),
    onSuccess: () => {
      toast.success(t('playground.backupRestored'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBackup({ data: { backupId: id } }),
    onSuccess: () => {
      toast.success(t('playground.backupDeleted'))
      void queryClient.invalidateQueries({ queryKey: ['profileSettings'] })
    },
  })

  return {
    backups: profileSettings.data?.profileBackups,
    backupName,
    setBackupName,
    backupMutation,
    restoreMutation,
    deleteMutation,
  }
}
