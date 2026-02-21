import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { Hero } from '@/components/Hero/Hero'
import { BasicInfo } from '@/components/Detail/BasicInfo'
import { Location } from '@/components/Detail/Location'
import { Contribution } from '@/components/Detail/Contribution'
import { GalleryGrid } from '@/components/Gallery/GalleryGrid'
import { Guestbook } from '@/components/Guestbook/Guestbook'
import { RSVP } from '@/components/RSVP/RSVP'
import { loadInvitationConfig } from '@/config/invitation'
import type { InvitationConfig } from '@/config/invitation'

export function InvitationPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin(user?.id)
  const [config, setConfig] = useState<InvitationConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    loadInvitationConfig()
      .then(setConfig)
      .catch((err) => setError(err instanceof Error ? err.message : '오류가 발생했습니다'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-margin)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-margin)]">
        <p className="text-red-600">{error ?? '오류가 발생했습니다'}</p>
      </div>
    )
  }

  return (
    <MobileFrame>
      <div className="flex min-h-dvh w-full flex-col gap-[60px]">
        <Hero config={config} />
        <BasicInfo config={config} />
        <Location config={config} />
        <Contribution config={config} />
        <GalleryGrid config={config} />
        <Guestbook config={config} />
        <RSVP config={config} />
        {user && (
          <div className="flex flex-col items-center gap-2 px-4 pb-8">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="text-xs text-[#f7f4f1]/60 hover:text-[#f7f4f1]/80"
            >
              로그아웃
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="text-xs text-[#f7f4f1]/60 hover:text-[#f7f4f1]/80"
              >
                admin 페이지 이동하기
              </button>
            )}
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div
            className="w-full max-w-[320px] rounded-[10px] bg-[var(--color-bg)] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="logout-dialog-title" className="font-maruburi text-center text-base font-medium text-[#f7f4f1]">
              로그아웃 하시겠습니까?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-[5px] border border-[#f7f4f1]/40 bg-transparent py-2.5 font-maruburi text-sm font-medium text-[#f7f4f1]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false)
                  signOut()
                }}
                className="flex-1 rounded-[5px] bg-[#FEEEE0] py-2.5 font-maruburi text-sm font-semibold text-[#3b291e]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  )
}
