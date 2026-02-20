import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  MessageCircle,
  Heart,
  MoreHorizontal,
  Trash2,
  Flag,
  Pin,
  Loader2,
  AlertCircle,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { ProfileCommentsModal } from './ProfileCommentsModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getProfileCommentsFn,
  createCommentFn,
  deleteCommentFn,
  toggleCommentLikeFn,
  reportCommentFn,
  togglePinCommentFn,
} from '../../server/functions/comments'

interface ProfileCommentsProps {
  profileUserId: string
  currentUserId?: string
  isProfileOwner: boolean
  borderRadius?: number
}

interface Comment {
  id: string
  content: string
  likes: number
  isPinned: boolean
  parentId: string | null
  createdAt: Date
  author: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    tier: string | null
  }
}

type SortOption = 'newest' | 'oldest' | 'popular'

export function ProfileComments({
  profileUserId,
  currentUserId,
  isProfileOwner,
  borderRadius = 16,
}: ProfileCommentsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isWriting, setIsWriting] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [reportingComment, setReportingComment] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<string>('')
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const getComments = useServerFn(getProfileCommentsFn)
  const createComment = useServerFn(createCommentFn)
  const deleteComment = useServerFn(deleteCommentFn)
  const toggleLike = useServerFn(toggleCommentLikeFn)
  const reportComment = useServerFn(reportCommentFn)
  const togglePin = useServerFn(togglePinCommentFn)

  const { data, isLoading, error } = useQuery({
    queryKey: ['profileComments', profileUserId],
    queryFn: () =>
      getComments({ data: { profileUserId, limit: 50, offset: 0 } }),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      createComment({ data: { profileUserId, content } }),
    onSuccess: () => {
      setIsWriting(false)
      void queryClient.invalidateQueries({
        queryKey: ['profileComments', profileUserId],
      })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment({ data: { commentId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['profileComments', profileUserId],
      })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete comment')
    },
  })

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => toggleLike({ data: { commentId } }),
    onSuccess: (result: { liked: boolean }, commentId) => {
      setLikedComments((prev) => {
        const next = new Set(prev)
        if (result.liked) next.add(commentId)
        else next.delete(commentId)
        return next
      })
      void queryClient.invalidateQueries({
        queryKey: ['profileComments', profileUserId],
      })
    },
  })

  const reportMutation = useMutation({
    mutationFn: ({
      commentId,
      reason,
    }: {
      commentId: string
      reason: string
    }) =>
      reportComment({
        data: {
          commentId,
          reason: reason as
            | 'spam'
            | 'harassment'
            | 'hate_speech'
            | 'inappropriate'
            | 'other',
        },
      }),
    onSuccess: () => {
      setReportingComment(null)
      setReportReason('')
    },
  })

  const pinMutation = useMutation({
    mutationFn: (commentId: string) => togglePin({ data: { commentId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['profileComments', profileUserId],
      })
    },
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const rawComments = data?.comments || []

  // Sort comments
  const comments = [...rawComments].sort((a: Comment, b: Comment) => {
    // Pinned always first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const sortLabels: Record<SortOption, string> = {
    newest: t('bioPage.comments.sortNewest'),
    oldest: t('bioPage.comments.sortOldest'),
    popular: t('bioPage.comments.sortPopular'),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageCircle size={20} />
          {t('bioPage.comments.title')} ({comments.length})
        </h2>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="h-8 w-[130px] bg-white/5 border-white/10 text-white/70 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a24] border-white/10">
              <SelectItem value="newest" className="text-white/70 focus:bg-white/10 focus:text-white">
                {sortLabels.newest}
              </SelectItem>
              <SelectItem value="oldest" className="text-white/70 focus:bg-white/10 focus:text-white">
                {sortLabels.oldest}
              </SelectItem>
              <SelectItem value="popular" className="text-white/70 focus:bg-white/10 focus:text-white">
                {sortLabels.popular}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Write Comment Button */}
          {currentUserId && (
            <motion.button
              onClick={() => setIsWriting(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PenLine size={14} />
              {t('bioPage.comments.writeComment')}
            </motion.button>
          )}
        </div>
      </div>

      {/* Comments Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-white/50" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p>Failed to load comments</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="font-medium text-white/60">
              {t('bioPage.comments.noComments')}
            </p>
            <p className="text-sm text-white/40 mt-1">
              {t('bioPage.comments.beFirst')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {comments.map((comment: Comment, index: number) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative p-4 rounded-xl group"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    border: comment.isPinned
                      ? '1px solid rgba(139, 92, 246, 0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Pinned Badge */}
                  {comment.isPinned && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium flex items-center gap-1">
                      <Pin size={10} />
                      {t('bioPage.comments.pinned')}
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <Link
                      to="/$username"
                      params={{ username: comment.author.username }}
                    >
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        }}
                      >
                        {comment.author.avatar ? (
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name || comment.author.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {(
                              comment.author.name?.[0] ||
                              comment.author.username?.[0] ||
                              'U'
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to="/$username"
                        params={{ username: comment.author.username }}
                        className="font-semibold text-sm text-white hover:underline truncate block"
                      >
                        {comment.author.name || comment.author.username}
                      </Link>
                      <span className="text-white/40 text-xs">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* More Menu */}
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === comment.id ? null : comment.id,
                          )
                        }
                        className="p-1 text-white/40 hover:text-white/60 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-6 z-20 py-1 rounded-lg bg-[#1a1a24] border border-white/10 shadow-xl min-w-[120px]"
                          >
                            {isProfileOwner && (
                              <button
                                onClick={() => {
                                  pinMutation.mutate(comment.id)
                                  setActiveMenu(null)
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2"
                              >
                                <Pin size={12} />
                                {comment.isPinned
                                  ? t('bioPage.comments.unpin')
                                  : t('bioPage.comments.pin')}
                              </button>
                            )}
                            {(isProfileOwner ||
                              comment.author.id === currentUserId) && (
                              <button
                                onClick={() => {
                                  deleteMutation.mutate(comment.id)
                                  setActiveMenu(null)
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-white/5 flex items-center gap-2"
                              >
                                <Trash2 size={12} />
                                {t('bioPage.comments.delete')}
                              </button>
                            )}
                            {currentUserId &&
                              comment.author.id !== currentUserId && (
                                <button
                                  onClick={() => {
                                    setReportingComment(comment.id)
                                    setActiveMenu(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Flag size={12} />
                                  {t('bioPage.comments.report')}
                                </button>
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-white/80 whitespace-pre-wrap break-words line-clamp-4">
                    {comment.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() =>
                        currentUserId && likeMutation.mutate(comment.id)
                      }
                      disabled={!currentUserId || likeMutation.isPending}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        likedComments.has(comment.id)
                          ? 'text-pink-400'
                          : 'text-white/40 hover:text-pink-400'
                      }`}
                    >
                      <Heart
                        size={12}
                        fill={
                          likedComments.has(comment.id)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                      <span>{comment.likes}</span>
                    </button>

                    <Sparkles size={12} className="text-white/20 ml-auto" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Sign in prompt */}
        {!currentUserId && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
            >
              {t('bioPage.comments.signInToComment')}
            </Link>
          </div>
        )}
      </div>

      {/* Write Comment Modal */}
      <ProfileCommentsModal
        isOpen={isWriting}
        onClose={() => setIsWriting(false)}
        onSubmit={(content) => createMutation.mutate(content)}
        isPending={createMutation.isPending}
        isError={createMutation.isError}
        errorMessage={(createMutation.error as Error)?.message}
      />

      {/* Report Modal */}
      <AnimatePresence>
        {reportingComment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setReportingComment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-[#1a1a24] border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {t('bioPage.comments.reportModal.title')}
              </h3>
              <p className="text-white/50 mb-4">
                {t('bioPage.comments.reportModal.description')}
              </p>

              <div className="space-y-2 mb-4">
                {[
                  'spam',
                  'harassment',
                  'hate_speech',
                  'inappropriate',
                  'other',
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      reportReason === reason
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    } border`}
                  >
                    {t(`bioPage.comments.reportReasons.${reason}`)}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReportingComment(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                >
                  {t('bioPage.comments.reportModal.cancel')}
                </button>
                <button
                  onClick={() => {
                    if (reportReason && reportingComment) {
                      reportMutation.mutate({
                        commentId: reportingComment,
                        reason: reportReason,
                      })
                    }
                  }}
                  disabled={!reportReason || reportMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    t('bioPage.comments.reportModal.submit')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
