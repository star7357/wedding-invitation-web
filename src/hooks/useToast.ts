import type { ReactNode } from 'react'
import { createElement, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const DURATION_MS = 2000

export function useToast(): { toast: ReactNode; showToast: (msg: string) => void } {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(msg)
    timerRef.current = setTimeout(() => {
      setMessage(null)
      timerRef.current = null
    }, DURATION_MS)
  }, [])

  const toast = message
    ? createPortal(
        createElement('div', {
          className:
            'fixed left-1/2 z-[9999] -translate-x-1/2 animate-fade-up rounded-lg bg-black/80 px-4 py-2.5 font-maruburi text-sm font-medium text-white shadow-lg',
          style: { bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' },
          role: 'status',
          'aria-live': 'polite',
        }, message),
        document.body
      )
    : null

  return { toast, showToast }
}
