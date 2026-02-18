import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export function Section({ children, className = '', animate = true }: SectionProps) {
  return (
    <section className={`px-4 py-5 ${animate ? 'animate-fade-up' : ''} ${className}`}>
      {children}
    </section>
  )
}
