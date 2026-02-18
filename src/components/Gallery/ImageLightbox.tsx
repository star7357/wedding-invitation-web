import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef(false)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (loaded[currentIndex]) return
    setProgress(0)
    const src = images[currentIndex]
    const xhr = new XMLHttpRequest()
    xhr.open('GET', src, true)
    xhr.responseType = 'blob'
    xhr.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const img = new Image()
      if (xhr.status === 200) {
        img.src = URL.createObjectURL(xhr.response)
      } else {
        img.src = src
      }
      img.onload = () => {
        setLoaded((prev) => ({ ...prev, [currentIndex]: true }))
        setProgress(100)
      }
    }
    xhr.onerror = () => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        setLoaded((prev) => ({ ...prev, [currentIndex]: true }))
      }
    }
    xhr.send()
  }, [currentIndex, images])

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1))
      if (e.key === 'ArrowRight')
        onNavigate(Math.min(images.length - 1, currentIndex + 1))
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [currentIndex, images.length, onClose, onNavigate])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || images.length === 0) return
    const rafId = requestAnimationFrame(() => {
      const w = el.clientWidth
      if (w <= 0) return
      isProgrammaticScrollRef.current = true
      el.scrollTo({ left: currentIndex * w, behavior: 'instant' })
      setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 50)
    })
    return () => cancelAnimationFrame(rafId)
  }, [currentIndex, images.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || images.length <= 1) return

    const handleScroll = () => {
      if (!el || isProgrammaticScrollRef.current) return
      const index = Math.round(el.scrollLeft / el.clientWidth)
      const clamped = Math.max(0, Math.min(images.length - 1, index))
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
  }, [currentIndex, images.length, onNavigate])

  if (images.length === 0) return null

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-black min-[480px]:flex min-[480px]:items-center min-[480px]:justify-center min-[480px]:bg-[var(--color-bg-outer)]"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '-webkit-fill-available',
      }}
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
    >
      <div className="relative flex h-full w-full overflow-hidden bg-black min-[480px]:h-[100dvh] min-[480px]:max-h-[100dvh] min-[480px]:max-w-[393px] min-[480px]:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute right-4 top-4 z-20 text-2xl text-white"
      >
        ✕
      </button>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex h-full w-full flex-row flex-nowrap snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth"
        style={{ touchAction: 'pan-x' }}
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="relative flex h-full w-full shrink-0 snap-center snap-always items-center justify-center"
            style={{ minWidth: '100%', width: '100%' }}
          >
            {loaded[i] ? (
              <img
                src={src}
                alt=""
                className="h-full w-full max-h-[100dvh] max-w-full object-contain select-none"
                draggable={false}
              />
            ) : i === currentIndex ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-12 w-12">
                  <svg className="h-12 w-12 -rotate-90 text-white/30" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${(progress / 100) * 100.5} 100.5`}
                      strokeLinecap="round"
                      className="text-white"
                    />
                  </svg>
                </div>
                <span className="font-maruburi text-sm text-white/70">{progress}%</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {images.length > 1 && (
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
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 min-h-[44px] min-w-[44px] text-4xl text-white touch-manipulation"
              aria-label="이전"
            >
              ‹
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onNavigate(currentIndex + 1)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 min-h-[44px] min-w-[44px] text-4xl text-white touch-manipulation"
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
