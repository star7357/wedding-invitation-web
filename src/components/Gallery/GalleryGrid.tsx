import { useEffect, useState } from 'react'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import { ImageLightbox } from './ImageLightbox'
import type { InvitationConfig } from '@/config/invitation'

const INITIAL_COUNT = 12

interface GalleryGridProps {
  config: InvitationConfig
}

type GalleryData = { full?: string[]; thumb?: string[] } | string[]

export function GalleryGrid({ config }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null)

  useEffect(() => {
    fetch('/assets/gallery.json')
      .then((res) => res.json())
      .then(setGalleryData)
      .catch(() => setGalleryData({ full: [], thumb: [] }))
  }, [])

  const data = galleryData ?? { full: [], thumb: [] }
  const fullImages = Array.isArray(data) ? data : (data?.full ?? [])
  const thumbImages = Array.isArray(data) ? data : (data?.thumb ?? fullImages)
  const displayCount = expanded ? fullImages.length : Math.min(INITIAL_COUNT, fullImages.length)
  const displayFull = fullImages.slice(0, displayCount)
  const displayThumb = thumbImages.slice(0, displayCount)
  const hasMore = fullImages.length > INITIAL_COUNT

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }

  return (
    <Section>
      <div className="flex flex-col items-center gap-[30px]">
        <div className="flex items-center justify-center gap-1.5">
          <Icon src="/assets/icons/section/gallery.svg" size={26} className="text-[#feeee0]" />
          <h2 className="font-maruburi text-base font-bold text-[#feeee0]">{config.copy.section_gallery}</h2>
        </div>
        {!galleryData ? (
          <div className="grid w-full grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#d2c7bd]/50" />
            ))}
          </div>
        ) : fullImages.length === 0 ? (
          <div className="grid w-full grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#d2c7bd]/50" />
            ))}
          </div>
        ) : (
          <div className="relative w-full">
            <div className="grid w-full grid-cols-3 gap-2">
              {displayFull.map((fullSrc, i) => (
                <button
                  key={`${fullSrc}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(fullImages.indexOf(fullSrc))}
                  className="aspect-square overflow-hidden rounded-[5px] transition hover:opacity-90"
                >
                  <img
                    src={displayThumb[i] ?? fullSrc}
                    alt={`갤러리 ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading={i >= INITIAL_COUNT ? 'lazy' : undefined}
                  />
                </button>
              ))}
            </div>
            {hasMore && (
              <>
                {!expanded && (
                  <div
                    className="absolute bottom-0 left-0 right-0 z-10 h-[120px] bg-gradient-to-t from-[var(--color-bg)] to-transparent"
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className={`flex w-full items-center justify-center gap-2 py-4 text-[#feeee0] transition hover:opacity-90 ${
                    expanded ? 'mt-3' : 'absolute bottom-0 left-0 right-0 z-20'
                  }`}
                  aria-label={expanded ? '접기' : '더보기'}
                >
                  <span className="font-maruburi text-sm font-semibold">
                    {expanded ? '접기' : '더보기'}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox
          images={fullImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </Section>
  )
}
