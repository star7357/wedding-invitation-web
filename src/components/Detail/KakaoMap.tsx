import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

declare global {
  interface Window {
    kakao?: {
      maps: {
        Map: new (el: HTMLElement, options: { center: unknown; level: number }) => unknown
        LatLng: new (lat: number, lng: number) => unknown
        Marker: new (options: { position: unknown; map?: unknown }) => unknown
        CustomOverlay: new (options: {
          map?: unknown
          position: unknown
          content: string | HTMLElement
          yAnchor?: number
        }) => void
        load: (callback: () => void) => void
        services: {
          Status: { OK: string }
          Geocoder: new () => {
            addressSearch: (address: string, callback: (result: { x: string; y: string }[], status: string) => void) => void
          }
        }
      }
    }
  }
}

export interface KakaoMapHandle {
  panToLocation: () => void
}

interface KakaoMapProps {
  address: string
  apiKey: string
  venueName?: string
}

export const KakaoMap = forwardRef<KakaoMapHandle, KakaoMapProps>(function KakaoMap(
  { address, apiKey, venueName },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ panTo: (pos: unknown) => void } | null>(null)
  const coordsRef = useRef<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useImperativeHandle(ref, () => ({
    panToLocation: () => {
      const map = mapRef.current
      const coords = coordsRef.current
      if (map && coords) {
        map.panTo(coords)
      }
    },
  }))

  useEffect(() => {
    if (!apiKey || !address || !containerRef.current) return

    setError(null)

    const initMap = () => {
      const kakao = window.kakao
      if (!kakao?.maps?.services?.Geocoder || !containerRef.current) {
        setError('카카오맵 로드 실패')
        return
      }

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(address, (result, status) => {
        if (status !== kakao.maps.services.Status.OK || !result?.[0] || !containerRef.current) {
          setError('주소를 찾을 수 없습니다')
          return
        }
        const coords = new kakao.maps.LatLng(parseFloat(result[0].y), parseFloat(result[0].x))
        coordsRef.current = coords

        const map = new kakao.maps.Map(containerRef.current, {
          center: coords,
          level: 3,
        }) as { relayout?: () => void; panTo: (pos: unknown) => void }
        mapRef.current = map

        if (kakao.maps.Marker) {
          new kakao.maps.Marker({ position: coords, map })
        }

        if (venueName && kakao.maps.CustomOverlay) {
          const lat = parseFloat(result[0].y)
          const lng = parseFloat(result[0].x)
          const labelPosition = new kakao.maps.LatLng(lat + 0.0004, lng)
          const content = document.createElement('div')
          content.style.cssText =
            'background:#fff;border-radius:6px;padding:4px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:12px;font-weight:600;color:#333;white-space:nowrap;border:1px solid #e0e0e0'
          content.textContent = venueName
          new kakao.maps.CustomOverlay({
            map,
            position: labelPosition,
            content,
            yAnchor: 1,
          })
        }

        setTimeout(() => map.relayout?.(), 100)
      })
    }

    if (window.kakao?.maps) {
      initMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao?.maps?.load(() => initMap())
    }
    script.onerror = () => setError('지도 스크립트 로드 실패')
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [address, apiKey, venueName])

  if (!apiKey) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-[5px] bg-[#d2c7bd] p-4">
        <p className="font-maruburi text-center text-sm text-[#3b291e]/70">
          .env에 VITE_KAKAO_MAP_KEY 설정 후 서버 재시작
        </p>
        <p className="font-maruburi text-center text-xs text-[#3b291e]/50">
          developers.kakao.com → JavaScript 키
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-[5px] bg-[#d2c7bd] p-4">
        <p className="font-maruburi text-center text-sm text-[#3b291e]/70">{error}</p>
        <p className="font-maruburi text-center text-xs text-[#3b291e]/50">
          카카오개발자사이트에서 도메인 등록 확인
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative z-0 aspect-video w-full min-h-[200px] overflow-hidden rounded-[5px] bg-[#d2c7bd]"
    />
  )
})
