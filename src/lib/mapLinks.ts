/**
 * 모바일에서 지도 앱 직접 실행, 실패 시 웹 URL로 fallback
 */

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

function getNaverAppUrl(venueName: string): string {
  return `nmap://search?query=${encodeURIComponent(venueName)}&appname=weddinginvitation`
}

function getKakaoAppUrl(
  maps: { kakao: string | { web: string; placeId?: string } }
): string | null {
  const kakao = maps.kakao
  let placeId: string | null = null
  if (typeof kakao === 'object' && kakao.placeId) {
    placeId = kakao.placeId
  } else {
    const web = typeof kakao === 'string' ? kakao : kakao.web
    const match = web.match(/place\.map\.kakao\.com\/(\d+)/) ?? web.match(/map\.kakao\.com\/link\/map\/(\d+)/)
    if (match) placeId = match[1]
  }
  return placeId ? `kakaomap://place?id=${placeId}` : null
}

function getWebUrl(
  value: string | { web: string }
): string {
  return typeof value === 'string' ? value : value.web
}

export function openNaverMap(
  maps: { naver: string | { web: string; lat?: number; lng?: number } },
  venueName: string
) {
  const web = getWebUrl(maps.naver)
  const app = getNaverAppUrl(venueName)

  if (isMobile()) {
    let fallbackTimer: ReturnType<typeof setTimeout>
    const clearFallback = () => {
      clearTimeout(fallbackTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clearFallback()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    fallbackTimer = setTimeout(() => {
      clearFallback()
      if (document.visibilityState === 'visible') window.open(web, '_blank')
    }, 1500)
    const link = document.createElement('a')
    link.href = app
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    window.open(web, '_blank')
  }
}

export function openKakaoMap(
  maps: { kakao: string | { web: string; placeId?: string } }
) {
  const web = getWebUrl(maps.kakao)
  const app = getKakaoAppUrl(maps)

  if (isMobile() && app) {
    let fallbackTimer: ReturnType<typeof setTimeout>
    const clearFallback = () => {
      clearTimeout(fallbackTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clearFallback()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    fallbackTimer = setTimeout(() => {
      clearFallback()
      if (document.visibilityState === 'visible') window.open(web, '_blank')
    }, 1500)
    const link = document.createElement('a')
    link.href = app
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    window.open(web, '_blank')
  }
}
