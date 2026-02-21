import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import { KakaoMap, type KakaoMapHandle } from './KakaoMap'
import { copyToClipboard } from '@/lib/clipboard'
import { openNaverMap, openKakaoMap } from '@/lib/mapLinks'
import type { InvitationConfig } from '@/config/invitation'

interface LocationProps {
  config: InvitationConfig
}

export function Location({ config }: LocationProps) {
  const { wedding, transport, copy } = config
  const { venue } = wedding
  const [toast, setToast] = useState(false)
  const mapRef = useRef<KakaoMapHandle>(null)

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.preventDefault()
    const ok = await copyToClipboard(venue.address)
    if (ok) {
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    }
  }

  return (
    <Section>
      <div className="relative flex flex-col items-center gap-[20px] px-1 text-[#feeee0]">
        <div className="flex items-center justify-center gap-1.5">
          <Icon src="/assets/icons/location/location.svg" size={26} className="text-[#feeee0]" />
          <h2 className="font-maruburi text-base font-bold">{copy.section_location}</h2>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-maruburi text-base font-bold text-center">{venue.name}</p>
          <div className="flex w-full items-center justify-center gap-2">
            <span className="h-9 w-9 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1 font-maruburi text-[15px] font-semibold text-center">{venue.address}</p>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="flex h-9 w-9 shrink-0 items-center justify-center p-1 text-[#feeee0] hover:opacity-80 active:opacity-100"
              aria-label="주소 복사"
            >
              <Icon src="/assets/icons/location/copy.svg" size={18} className="text-[#feeee0]" />
            </button>
          </div>
        </div>
        <div className="flex w-full flex-col gap-[32px]">
          <div className="flex w-full flex-col gap-[13px]">
          <div className="relative w-full">
            <KakaoMap
              ref={mapRef}
              address={venue.address}
              apiKey={import.meta.env.VITE_KAKAO_MAP_KEY ?? ''}
              venueName={venue.name}
            />
            <button
              type="button"
              onClick={() => mapRef.current?.panToLocation()}
              className="absolute bottom-2 right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#3b291e] shadow-lg transition hover:opacity-90 active:opacity-95"
              aria-label="결혼식장소로 포커스"
            >
              <Icon src="/assets/icons/location/location.svg" size={20} className="text-[#3b291e]" />
            </button>
          </div>
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => openNaverMap(venue.maps, venue.name)}
              className="flex flex-1 items-center justify-center rounded-[5px] bg-[#C5F9B8] px-2.5 py-2.5 text-sm font-semibold text-[#3E8D5B] shadow-[1px_2.5px_4px_#28170d]"
            >
              <div className="flex items-center gap-[5px]">
                <img
                  src="/assets/icons/icon_navermap.png"
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                  aria-hidden
                />
                네이버지도
              </div>
            </button>
            <button
              type="button"
              onClick={() => openKakaoMap(venue.maps)}
              className="flex flex-1 items-center justify-center rounded-[5px] bg-[#FFF5A3] px-2.5 py-2.5 text-sm font-medium text-[#938A3E] shadow-[1px_2.5px_4px_#28170d]"
            >
              <div className="flex items-center gap-[10px]">
                <img
                  src="/assets/icons/icon_kakaomap.png"
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                  aria-hidden
                />
                카카오맵
              </div>
            </button>
          </div>
        </div>
        <div className="w-full space-y-[32px]">
          <div>
            <div className="flex items-center gap-1">
              <Icon src="/assets/icons/location/public-transportation.svg" size={16} className="text-[#feeee0]" />
              <span className="font-maruburi text-base font-bold">대중교통</span>
            </div>
            <p className="mt-1.5 font-maruburi text-sm font-semibold">{transport.public}</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Icon src="/assets/icons/location/parking.svg" size={16} className="text-[#feeee0]" />
              <span className="font-maruburi text-base font-bold">주차</span>
            </div>
            <p className="mt-1.5 font-maruburi text-sm font-semibold">{transport.parking}</p>
          </div>
        </div>
        </div>
        {toast &&
          createPortal(
            <div className="fixed left-1/2 z-[9999] -translate-x-1/2 animate-fade-up rounded-lg bg-black/80 px-4 py-2.5 font-maruburi text-sm font-medium text-white shadow-lg" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              복사되었습니다
            </div>,
            document.body
          )}
      </div>
    </Section>
  )
}
