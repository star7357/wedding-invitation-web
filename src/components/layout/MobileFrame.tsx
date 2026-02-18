import type { ReactNode } from 'react'

interface MobileFrameProps {
  children: ReactNode
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-dvh w-full bg-[var(--color-bg)] min-[480px]:flex min-[480px]:items-center min-[480px]:justify-center min-[480px]:bg-[var(--color-bg-outer)]">
      <div className="min-h-dvh w-full min-[480px]:max-w-[393px] min-[480px]:bg-[var(--color-bg)] min-[480px]:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        {children}
      </div>
    </div>
  )
}
