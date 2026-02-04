import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  FolderOpen,
  Search,
  Grid3X3,
  List,
  Check,
  X,
  Copy,
  MoreHorizontal,
  FolderPlus,
  Loader2,
  HardDrive,
  Sparkles,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getMediaLibraryFn,
  getMediaFoldersFn,
  getMediaStatsFn,
  deleteMediaItemFn,
  deleteMediaItemsFn,
  moveToFolderFn,
  addMediaItemFn,
} from '@/server/functions/media-library'
import { uploadMediaFn } from '@/server/functions/upload'
import { useTheme } from '@/components/layout/ThemeProvider'

interface MediaItem {
  id: string
  filename: string
  originalName: string | null
  mimeType: string | null
  size: number | null
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  folder: string | null
  alt: string | null
  createdAt: Date
}

export function MediaLibraryTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [newFolderDialog, setNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Card style based on theme
  const getCardStyle = () => {
    switch (theme.effects.cardStyle) {
      case 'glass':
        return 'backdrop-blur-xl bg-card/10 border border-border/20'
      case 'neon':
        return 'bg-card/5 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]'
      case 'gradient':
        return 'bg-linear-to-br from-card/20 to-background-secondary/20 border border-border/20'
      case 'flat':
      default:
        return 'bg-card border border-border/30'
    }
  }
  const cardStyle = getCardStyle()

  // Queries
  const { data: mediaData, isLoading: loadingMedia } = useQuery({
    queryKey: ['media-library', selectedFolder, searchQuery],
    queryFn: () =>
      getMediaLibraryFn({
        data: {
          folder: selectedFolder || undefined,
          search: searchQuery || undefined,
        },
      }),
  })

  const { data: foldersData } = useQuery({
    queryKey: ['media-folders'],
    queryFn: () => getMediaFoldersFn(),
  })

  const { data: statsData } = useQuery({
    queryKey: ['media-stats'],
    queryFn: () => getMediaStatsFn(),
  })

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file)
      const result = await uploadMediaFn({
        data: { image: base64, folder: selectedFolder || undefined },
      })

      // Add to media library
      await addMediaItemFn({
        data: {
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: result.url,
          folder: selectedFolder || undefined,
        },
      })

      return result
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-library'] })
      void queryClient.invalidateQueries({ queryKey: ['media-stats'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMediaItemFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-library'] })
      void queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      setDeleteConfirm(null)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteMediaItemsFn({ data: { ids } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-library'] })
      void queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      setSelectedItems(new Set())
      setBulkDeleteConfirm(false)
    },
  })

  const moveMutation = useMutation({
    mutationFn: ({ ids, folder }: { ids: string[]; folder: string | null }) =>
      moveToFolderFn({ data: { ids, folder } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-library'] })
      void queryClient.invalidateQueries({ queryKey: ['media-folders'] })
      setSelectedItems(new Set())
    },
  })

  // Helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      const totalFiles = files.length
      let completed = 0

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue

        try {
          await uploadMutation.mutateAsync(file)
          completed++
          setUploadProgress(Math.round((completed / totalFiles) * 100))
        } catch (error) {
          console.error('Upload failed:', error)
        }
      }

      setIsUploading(false)
      setUploadProgress(0)
    },
    [uploadMutation],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      void handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    if (mediaData?.items) {
      setSelectedItems(
        new Set(mediaData.items.map((item: MediaItem) => item.id)),
      )
    }
  }

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const items = mediaData?.items || []
  const folders = foldersData?.folders || []
  const stats = statsData || { totalItems: 0, totalSize: 0 }

  // Loading state
  if (loadingMedia && !mediaData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full border-2 animate-spin"
            style={{
              borderColor: theme.colors.primary + '20',
              borderTopColor: theme.colors.primary,
            }}
          />
          <Sparkles
            className="absolute inset-0 m-auto h-6 w-6"
            style={{ color: theme.colors.primary }}
          />
        </div>
        <p style={{ color: theme.colors.foregroundMuted }}>
          {t('common.loading')}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}10, transparent, ${theme.colors.accent}10)`,
          borderColor: theme.colors.border + '50',
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: theme.colors.primary + '15' }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: theme.colors.primary + '20' }}
              >
                <ImageIcon
                  className="h-5 w-5"
                  style={{ color: theme.colors.primary }}
                />
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: theme.colors.foreground }}
              >
                {t('mediaLibrary.title')}
              </h1>
            </div>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('mediaLibrary.description')}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border"
              style={{
                backgroundColor: theme.colors.background + 'cc',
                borderColor: theme.colors.border + '50',
              }}
            >
              <ImageIcon
                className="h-4 w-4"
                style={{ color: theme.colors.primary }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {stats.totalItems} {t('mediaLibrary.files')}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border"
              style={{
                backgroundColor: theme.colors.background + 'cc',
                borderColor: theme.colors.border + '50',
              }}
            >
              <HardDrive
                className="h-4 w-4"
                style={{ color: theme.colors.accent }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {formatFileSize(stats.totalSize)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl ${cardStyle}`}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: theme.colors.foregroundMuted }}
          />
          <Input
            placeholder={t('mediaLibrary.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border + '50',
              color: theme.colors.foreground,
            }}
          />
        </div>

        {/* Folder Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              style={{
                borderColor: theme.colors.border + '50',
                color: theme.colors.foreground,
              }}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {selectedFolder || t('mediaLibrary.allFiles')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedFolder(null)}>
              {t('mediaLibrary.allFiles')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {folders.map((folder) => (
              <DropdownMenuItem
                key={folder}
                onClick={() => setSelectedFolder(folder)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {folder}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setNewFolderDialog(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              {t('mediaLibrary.newFolder')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: theme.colors.border + '50' }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 transition-colors"
            style={{
              backgroundColor:
                viewMode === 'grid'
                  ? theme.colors.primary + '20'
                  : 'transparent',
              color:
                viewMode === 'grid'
                  ? theme.colors.primary
                  : theme.colors.foregroundMuted,
            }}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 transition-colors"
            style={{
              backgroundColor:
                viewMode === 'list'
                  ? theme.colors.primary + '20'
                  : 'transparent',
              color:
                viewMode === 'list'
                  ? theme.colors.primary
                  : theme.colors.foregroundMuted,
            }}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}dd)`,
          }}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? `${uploadProgress}%` : t('mediaLibrary.upload')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFileUpload(e.target.files)}
        />
      </div>

      {/* Selection Actions */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between p-4 rounded-xl ${cardStyle}`}
          >
            <div className="flex items-center gap-2">
              <Badge
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  color: theme.colors.primary,
                }}
              >
                {selectedItems.size} {t('mediaLibrary.selected')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
                style={{ color: theme.colors.foregroundMuted }}
              >
                <X className="h-4 w-4 mr-1" />
                {t('common.cancel')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                style={{ color: theme.colors.foregroundMuted }}
              >
                <Check className="h-4 w-4 mr-1" />
                {t('mediaLibrary.selectAll')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: theme.colors.border + '50',
                      color: theme.colors.foreground,
                    }}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {t('mediaLibrary.move')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      moveMutation.mutate({
                        ids: Array.from(selectedItems),
                        folder: null,
                      })
                    }
                  >
                    {t('mediaLibrary.noFolder')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder}
                      onClick={() =>
                        moveMutation.mutate({
                          ids: Array.from(selectedItems),
                          folder,
                        })
                      }
                    >
                      {folder}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                style={{ borderColor: theme.colors.border + '50' }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('mediaLibrary.delete')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isUploading ? 'opacity-50 pointer-events-none' : ''
        }`}
        style={{
          borderColor: theme.colors.border + '50',
          backgroundColor: theme.colors.background + '50',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="p-4 rounded-full"
            style={{ backgroundColor: theme.colors.primary + '10' }}
          >
            <Upload
              className="h-8 w-8"
              style={{ color: theme.colors.primary }}
            />
          </div>
          <div>
            <p
              className="font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {t('mediaLibrary.dropzone.title')}
            </p>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('mediaLibrary.dropzone.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <div
            className="p-6 rounded-full"
            style={{ backgroundColor: theme.colors.primary + '10' }}
          >
            <ImageIcon
              className="h-12 w-12"
              style={{ color: theme.colors.primary }}
            />
          </div>
          <div className="text-center">
            <p
              className="font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {t('mediaLibrary.empty.title')}
            </p>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('mediaLibrary.empty.subtitle')}
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}dd)`,
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('mediaLibrary.uploadFirst')}
          </Button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item: MediaItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                selectedItems.has(item.id) ? 'ring-2' : ''
              }`}
              style={{
                borderColor: theme.colors.border + '30',
              }}
              onClick={() => toggleSelectItem(item.id)}
            >
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.alt || item.filename}
                className="w-full h-full object-cover"
              />

              {/* Hover Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewItem(item)
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Eye className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    void copyToClipboard(item.url)
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {copiedUrl === item.url ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(item)
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Selection Checkbox */}
              <div
                className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedItems.has(item.id)
                    ? ''
                    : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedItems.has(item.id)
                    ? theme.colors.primary
                    : 'rgba(255,255,255,0.8)',
                  borderColor: selectedItems.has(item.id)
                    ? theme.colors.primary
                    : theme.colors.border,
                }}
              >
                {selectedItems.has(item.id) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>

              {/* File Info */}
              <div
                className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                }}
              >
                <p className="text-xs text-white truncate">{item.filename}</p>
                <p className="text-xs text-white/60">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: MediaItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedItems.has(item.id) ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: theme.colors.card + '50',
                borderColor: theme.colors.border + '30',
              }}
              onClick={() => toggleSelectItem(item.id)}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || item.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  style={{ color: theme.colors.foreground }}
                >
                  {item.filename}
                </p>
                <div
                  className="flex items-center gap-3 text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  <span>{formatFileSize(item.size)}</span>
                  {item.width && item.height && (
                    <span>
                      {item.width} × {item.height}
                    </span>
                  )}
                  {item.folder && (
                    <Badge variant="outline" className="text-xs">
                      {item.folder}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewItem(item)
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.foregroundMuted }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      theme.colors.primary + '10')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    void copyToClipboard(item.url)
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color:
                      copiedUrl === item.url
                        ? '#10b981'
                        : theme.colors.foregroundMuted,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      theme.colors.primary + '10')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  {copiedUrl === item.url ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('mediaLibrary.openInNewTab')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = item.url
                        a.download = item.filename
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('mediaLibrary.download')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirm(item)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('mediaLibrary.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.filename}</DialogTitle>
            <DialogDescription>
              {previewItem && (
                <span className="flex items-center gap-2">
                  {formatFileSize(previewItem.size)}
                  {previewItem.width && previewItem.height && (
                    <span>
                      • {previewItem.width} × {previewItem.height}
                    </span>
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/10">
              <img
                src={previewItem.url}
                alt={previewItem.alt || previewItem.filename}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                previewItem && void copyToClipboard(previewItem.url)
              }
            >
              <Copy className="h-4 w-4 mr-2" />
              {copiedUrl === previewItem?.url
                ? t('common.copied')
                : t('mediaLibrary.copyUrl')}
            </Button>
            <Button
              onClick={() =>
                previewItem && window.open(previewItem.url, '_blank')
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('mediaLibrary.openInNewTab')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('mediaLibrary.deleteConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('mediaLibrary.deleteConfirm.description', {
                filename: deleteConfirm?.filename,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && deleteMutation.mutate(deleteConfirm.id)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('mediaLibrary.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('mediaLibrary.bulkDeleteConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('mediaLibrary.bulkDeleteConfirm.description', {
                count: selectedItems.size,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                bulkDeleteMutation.mutate(Array.from(selectedItems))
              }
              className="bg-red-500 hover:bg-red-600"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('mediaLibrary.deleteSelected')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mediaLibrary.newFolder')}</DialogTitle>
            <DialogDescription>
              {t('mediaLibrary.newFolderDescription')}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder={t('mediaLibrary.folderName')}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (newFolderName.trim()) {
                  setSelectedFolder(newFolderName.trim())
                  setNewFolderName('')
                  setNewFolderDialog(false)
                }
              }}
              disabled={!newFolderName.trim()}
            >
              {t('mediaLibrary.createFolder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
