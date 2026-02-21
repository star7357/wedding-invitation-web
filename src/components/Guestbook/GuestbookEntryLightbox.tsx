import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/ui/Icon'
import type { GuestbookEntry } from '@/hooks/useGuestbook'

interface GuestbookEntryLightboxProps {
  entries: GuestbookEntry[]
  allEntries: GuestbookEntry[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  heartLikedIds?: Set<string>
  onHeart?: (entryId: string) => void
  onDelete?: (entryId: string) => void
  onAddComment?: (parentId: string, message: string) => Promise<void>
  canDelete?: (entry: GuestbookEntry) => boolean
  user?: { id: string } | null
}

export function GuestbookEntryLightbox({
  entries,
  allEntries,
  currentIndex,
  onClose,
  onNavigate,
  heartLikedIds,
  onHeart,
  onDelete,
  onAddComment,
  canDelete,
  user,
}: GuestbookEntryLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef(false)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1))
      if (e.key === 'ArrowRight') onNavigate(Math.min(entries.length - 1, currentIndex + 1))
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [currentIndex, entries.length, onClose, onNavigate])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || entries.length === 0) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const rafId = requestAnimationFrame(() => {
      const w = el.clientWidth
      if (w <= 0) return
      isProgrammaticScrollRef.current = true
      el.scrollTo({ left: currentIndex * w, behavior: 'instant' })
      timeoutId = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 50)
    })
    return () => {
      cancelAnimationFrame(rafId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [currentIndex, entries.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || entries.length <= 1) return

    const handleScroll = () => {
      if (!el || isProgrammaticScrollRef.current) return
      const index = Math.round(el.scrollLeft / el.clientWidth)
      const clamped = Math.max(0, Math.min(entries.length - 1, index))
      if (clamped !== currentIndex) onNavigate(clamped)
    }

    let rafId: number
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [currentIndex, entries.length, onNavigate])

  if (entries.length === 0) return null

  const currentEntry = entries[currentIndex]

  const handleAddComment = async () => {
    if (!commentText.trim() || !onAddComment || !user || !currentEntry) return
    if (!confirm('댓글을 등록할까요?')) return
    setCommentSubmitting(true)
    try {
      await onAddComment(currentEntry.id, commentText.trim())
      setCommentText('')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[var(--color-bg)] min-[480px]:items-center min-[480px]:bg-[var(--color-bg-outer)]"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '-webkit-fill-available',
      }}
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden min-[480px]:h-full min-[480px]:max-w-[393px] min-[480px]:bg-[var(--color-bg)] min-[480px]:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 text-2xl text-[var(--color-cream)]"
        aria-label="닫기"
      >
        ✕
      </button>

      <div className="grid min-h-0 flex-1 grid-rows-[48px_1fr_auto]">
        <div aria-hidden />
        <div
          ref={scrollRef}
          className="scrollbar-hide flex min-h-0 flex-row flex-nowrap snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth"
          style={{ touchAction: 'pan-x' }}
          onClick={(e) => e.stopPropagation()}
        >
        {entries.map((e, idx) => {
          const cardComments = allEntries.filter((c) => c.parent_id === e.id)
          return (
          <div
            key={e.id}
            className="relative flex h-full w-full shrink-0 snap-center snap-always items-center justify-center px-6 py-4"
            style={{ minWidth: '100%', width: '100%' }}
          >
            <div className="flex min-h-0 w-full max-w-[360px] max-h-full flex-col rounded-lg bg-[#f7f4f124] px-5 py-5 font-maruburi">
              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      {e.author_avatar ? (
                        <img
                          src={e.author_avatar}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--color-primary)]/20" />
                      )}
                      <span className="truncate font-maruburi text-lg font-semibold text-[var(--color-cream)]">
                        {e.author_name}
                      </span>
                    </div>
                    {canDelete?.(e) && onDelete && (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          onDelete(e.id)
                        }}
                        onPointerDown={(ev) => ev.stopPropagation()}
                        className="shrink-0 p-2 text-[var(--color-cream)]/60 hover:text-[var(--color-cream)]"
                        aria-label="삭제"
                      >
                        <Icon src="/assets/icons/guestbook/trash.svg" size={20} />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap font-maruburi text-base leading-relaxed text-[var(--color-cream)]">
                    {e.message}
                  </p>
                  <div className="flex items-center justify-between gap-4 text-sm text-[var(--color-cream)]/70">
                    <p className="text-[var(--color-cream)]/60">
                      {new Date(e.created_at).toLocaleDateString('ko-KR')}
                    </p>
                    {onHeart ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:opacity-80 touch-manipulation"
                        onClick={(ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          onHeart(e.id)
                        }}
                        onPointerDown={(ev) => ev.stopPropagation()}
                        aria-label="하트"
                      >
                        <Icon
                          src="/assets/icons/guestbook/heart.svg"
                          size={16}
                          className={heartLikedIds?.has(e.id) ? 'text-accent' : ''}
                        />
                        {e.likes}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Icon src="/assets/icons/guestbook/heart.svg" size={16} />
                        {e.likes}
                      </span>
                    )}
                  </div>
                  {cardComments.length > 0 && (
                    <div className="mt-1 space-y-4 border-t-2 border-white pt-4">
                      {cardComments.map((c) => (
                        <div key={c.id} className="flex flex-col gap-2 border-b border-white/40 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              {c.author_avatar ? (
                                <img
                                  src={c.author_avatar}
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-primary)]/20" />
                              )}
                              <span className="truncate font-semibold text-[var(--color-cream)]">
                                {c.author_name}
                              </span>
                            </div>
                            {canDelete?.(c) && onDelete && (
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.preventDefault()
                                  ev.stopPropagation()
                                  onDelete(c.id)
                                }}
                                onPointerDown={(ev) => ev.stopPropagation()}
                                className="-ml-1 shrink-0 p-1.5 text-[var(--color-cream)]/60 hover:text-[var(--color-cream)] touch-manipulation"
                                aria-label="댓글 삭제"
                              >
                                <Icon src="/assets/icons/guestbook/trash.svg" size={18} />
                              </button>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--color-cream)]">
                            {c.message}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-sm text-[var(--color-cream)]/70">
                            <span className="text-[var(--color-cream)]/60">
                              {new Date(c.created_at).toLocaleDateString('ko-KR')}
                            </span>
                            {onHeart ? (
                              <button
                                type="button"
                                className="flex items-center gap-1 hover:opacity-80 touch-manipulation"
                                onClick={(ev) => {
                                  ev.preventDefault()
                                  ev.stopPropagation()
                                  onHeart(c.id)
                                }}
                                onPointerDown={(ev) => ev.stopPropagation()}
                                aria-label="하트"
                              >
                                <Icon
                                  src="/assets/icons/guestbook/heart.svg"
                                  size={14}
                                  className={heartLikedIds?.has(c.id) ? 'text-accent' : ''}
                                />
                                {c.likes}
                              </button>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Icon src="/assets/icons/guestbook/heart.svg" size={14} />
                                {c.likes}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {user && onAddComment && idx === currentIndex && (
                <div className="mt-3 shrink-0">
                  <div className="flex w-full items-center gap-1.5 rounded-[5px] bg-[#f7f4f124] px-3 py-2">
                    <textarea
                      value={commentText}
                      onChange={(ev) => setCommentText(ev.target.value)}
                      placeholder="댓글을 입력해주세요"
                      rows={1}
                      className="min-h-[36px] min-w-0 flex-1 resize-none bg-transparent py-[10px] font-maruburi text-base text-[#f7f4f1] placeholder:text-sm placeholder:leading-[24px] placeholder:text-[#f7f4f1]/60 focus:outline-none"
                      onFocus={(ev) => {
                        setTimeout(() => ev.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
                      }}
                    />
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        handleAddComment()
                      }}
                      disabled={commentSubmitting || !commentText.trim()}
                      className="flex shrink-0 items-center justify-center self-center p-1 text-[#f7f4f1] disabled:opacity-50"
                      aria-label="전송"
                    >
                      <Icon src="/assets/icons/guestbook/send.svg" size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )
        })}
        </div>

        {entries.length > 1 && (
          <div className="flex min-h-0 justify-center py-1">
            <span className="rounded-full bg-[var(--color-primary)]/50 px-3 py-1 font-maruburi text-sm text-[var(--color-cream)]">
              {currentIndex + 1} / {entries.length}
            </span>
          </div>
        )}
      </div>

      {entries.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onNavigate(currentIndex - 1)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 min-h-[44px] min-w-[44px] text-4xl text-[var(--color-cream)] touch-manipulation"
              aria-label="이전"
            >
              ‹
            </button>
          )}
          {currentIndex < entries.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onNavigate(currentIndex + 1)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 min-h-[44px] min-w-[44px] text-4xl text-[var(--color-cream)] touch-manipulation"
              aria-label="다음"
            >
              ›
            </button>
          )}
        </>
      )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
