import { useEffect, useState } from 'react'
import { MobileFrame } from '@/components/layout/MobileFrame'
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
  const [config, setConfig] = useState<InvitationConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      </div>
    </MobileFrame>
  )
}
