import { useState } from 'react'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import { GuestbookEntryLightbox } from './GuestbookEntryLightbox'
import { useAuth } from '@/hooks/useAuth'
import { useGuestbook } from '@/hooks/useGuestbook'
import { useToast } from '@/hooks/useToast'
import type { GuestbookEntry } from '@/hooks/useGuestbook'
import type { InvitationConfig } from '@/config/invitation'

const SKELETON_CARD_COUNT = 3
const CARD_PREVIEW_LENGTH = 45

function truncateForPreview(text: string, maxLen: number = CARD_PREVIEW_LENGTH): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + '…'
}

interface GuestbookProps {
  config: InvitationConfig
}

function SkeletonCard() {
  return (
    <div className="flex h-[192px] w-[167px] shrink-0 flex-col rounded-[5px] bg-[#f7f4f124] p-3.5 font-maruburi">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 shrink-0 rounded-full bg-[#f7f4f1]/30" />
        <div className="h-4 w-16 rounded bg-[#f7f4f1]/30" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-full rounded bg-[#f7f4f1]/30" />
        <div className="h-3 w-3/4 rounded bg-[#f7f4f1]/30" />
      </div>
      <div className="mt-auto flex gap-3">
        <div className="h-3 w-8 rounded bg-[#f7f4f1]/30" />
        <div className="h-3 w-8 rounded bg-[#f7f4f1]/30" />
      </div>
    </div>
  )
}

function GuestbookCard({
  entry,
  onClick,
  onDelete,
  canDelete,
  heartLikedIds,
  onHeart,
  commentCount = 0,
}: {
  entry: GuestbookEntry
  onClick: () => void
  onDelete?: (id: string) => void
  canDelete?: boolean
  heartLikedIds?: Set<string>
  onHeart?: (id: string) => void
  commentCount?: number
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex h-[192px] w-[167px] shrink-0 cursor-pointer flex-col rounded-[5px] bg-[#f7f4f124] p-3.5 font-maruburi text-left transition hover:opacity-95"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {entry.author_avatar ? (
            <img
              src={entry.author_avatar}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-accent/20" />
          )}
          <span className="truncate font-semibold text-[#f7f4f1]">{entry.author_name}</span>
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center p-1 text-[#f7f4f1]/60 hover:text-[#f7f4f1] touch-manipulation"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(entry.id)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="삭제"
          >
            <Icon src="/assets/icons/guestbook/trash.svg" size={14} />
          </button>
        )}
      </div>
      <p className="mt-2 min-h-0 flex-1 overflow-hidden text-left text-sm leading-relaxed text-[#f7f4f1]">
        {truncateForPreview(entry.message)}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-[#f7f4f1]/70">
        <span className="text-[#f7f4f1]/60">
          {new Date(entry.created_at).toLocaleDateString('ko-KR')}
        </span>
        <div className="flex items-center gap-2">
          {onHeart ? (
            <button
              type="button"
              className="flex items-center gap-1 hover:opacity-80 touch-manipulation"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onHeart(entry.id)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="하트"
            >
              <Icon
                src="/assets/icons/guestbook/heart.svg"
                size={14}
                className={heartLikedIds?.has(entry.id) ? 'text-accent' : ''}
              />
              {entry.likes}
            </button>
          ) : (
            <span className="flex items-center gap-1">
              <Icon src="/assets/icons/guestbook/heart.svg" size={14} />
              {entry.likes}
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[#f7f4f1]/70">
              <Icon src="/assets/icons/guestbook/comment.svg" size={14} />
              {commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Guestbook({ config }: GuestbookProps) {
  const { user, signInWithKakao } = useAuth()
  const { entries, loading, error, heartLikedIds, addEntry, deleteEntry, toggleHeart } = useGuestbook(user?.id)
  const { toast, showToast } = useToast()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const authorName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.nickname ??
    user?.user_metadata?.user_name ??
    user?.email ??
    '익명'

  const authorAvatar =
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    user?.user_metadata?.profile_image

  const handleSubmit = async () => {
    if (!message.trim() || !user) return
    if (!confirm('방명록을 등록할까요?')) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await addEntry(message.trim(), authorName, user.id, authorAvatar)
      setMessage('')
      showToast('방명록이 등록되었습니다')
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : String(err)
      setSubmitError(msg)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayEntries = entries.filter((e) => !e.parent_id)
  const showSkeleton = !loading && !error && entries.length === 0

  return (
    <Section>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-1.5">
          <Icon src="/assets/icons/section/guestbook.svg" size={26} className="text-[#feeee0]" />
          <h2 className="font-maruburi text-base font-bold text-[#feeee0]">
            {config.copy.section_guestbook}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="scrollbar-hide -mx-4 w-[calc(100%+2rem)] overflow-x-auto">
            <div className="flex gap-3 px-4">
              {showSkeleton ? (
                Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : (
                displayEntries.map((entry, i) => (
                  <GuestbookCard
                    key={entry.id}
                    entry={entry}
                    commentCount={entries.filter((e) => e.parent_id === entry.id).length}
                    onClick={() => setLightboxIndex(i)}
                    onDelete={async (id) => {
                      if (!confirm('삭제하시겠습니까?')) return
                      await deleteEntry(id)
                      showToast('삭제되었습니다')
                    }}
                    canDelete={user?.id === entry.user_id}
                    heartLikedIds={user ? heartLikedIds : undefined}
                    onHeart={user ? toggleHeart : undefined}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {!user ? (
          <button
            type="button"
            onClick={async () => {
              if (!import.meta.env.VITE_SUPABASE_URL) {
                alert(
                  'Supabase가 설정되지 않았습니다.\n.env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 추가해주세요.'
                )
                return
              }
              try {
                await signInWithKakao()
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                alert(`카카오 로그인 실패: ${msg}\n\n브라우저 콘솔(F12)에서 자세한 오류를 확인해보세요.`)
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEA91] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] shadow-[1px_2.5px_4px_#28170d]"
          >
            <img
              src="/assets/icons/auth/kakaotalk.svg"
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
              aria-hidden
            />
            카카오톡 로그인하여 신랑신부에게 메시지 보내기
          </button>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <div className="flex h-[54px] w-full items-center gap-1.5 self-center rounded-[5px] bg-[#f7f4f124] px-3 py-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={config.copy.guestbook_placeholder ?? '신랑신부에게 전하고 싶은 메세지를 입력해주세요'}
                rows={1}
                className="min-h-[36px] min-w-0 flex-1 resize-none self-center bg-transparent py-[10px] font-maruburi text-base text-[#f7f4f1] placeholder:text-sm placeholder:leading-[24px] placeholder:text-[#f7f4f1]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !message.trim()}
                className="flex shrink-0 items-center justify-center self-center p-1 text-[#f7f4f1] disabled:opacity-50"
                aria-label="전송"
              >
                <Icon src="/assets/icons/guestbook/send.svg" size={18} />
              </button>
            </div>
            {submitError && (
              <p className="min-h-[20px] text-sm text-red-400">{submitError}</p>
            )}
          </div>
        )}
      </div>

      {lightboxIndex !== null && displayEntries.length > 0 && (
        <GuestbookEntryLightbox
          entries={displayEntries}
          allEntries={entries}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          heartLikedIds={user ? heartLikedIds : undefined}
          onHeart={user ? toggleHeart : undefined}
          onDelete={async (id) => {
            if (!confirm('삭제하시겠습니까?')) return
            await deleteEntry(id)
            showToast('삭제되었습니다')
          }}
          onAddComment={
            user
              ? async (parentId, msg) => {
                  await addEntry(msg, authorName, user.id, authorAvatar, parentId)
                  showToast('댓글이 등록되었습니다')
                }
              : undefined
          }
          canDelete={user ? (e) => user.id === e.user_id : undefined}
          user={user ?? undefined}
        />
      )}
      {toast}
    </Section>
  )
}
