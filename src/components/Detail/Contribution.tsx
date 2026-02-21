import { type ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import { copyToClipboard } from '@/lib/clipboard'
import type { InvitationConfig } from '@/config/invitation'

interface ContributionProps {
  config: InvitationConfig
}

function AccountEntry({
  label,
  account,
  onCopy,
}: {
  label: string
  account: string
  onCopy?: () => void
}) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const ok = await copyToClipboard(account)
    if (ok) onCopy?.()
  }

  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#FEEEE0] px-4 py-2.5 text-sm">
      <div>
        <p className="font-maruburi font-bold text-[#3b291e]">{label}</p>
        <p className="mt-0.5 font-mono text-xs text-[#3b291e]/90">{account}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-1.5 text-[#3b291e] hover:bg-black/10 active:bg-black/15"
        title="복사"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </div>
  )
}

function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="w-full overflow-hidden rounded-[10px] shadow-[1px_2.5px_4px_#28170d]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-full items-center justify-between rounded-t-[10px] bg-[#D4C0B4] px-4 text-left"
      >
        <span className="font-maruburi text-[13px] font-bold text-[#3b291e]">{title}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-[#3b291e] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="space-y-2 rounded-b-[10px] bg-[#D4C0B4] border-t border-[#D4C0B4]/80 p-3">
          {children}
        </div>
      )}
    </div>
  )
}

export function Contribution({ config }: ContributionProps) {
  const { groom, bride, copy } = config
  const [toast, setToast] = useState(false)

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const groomAccounts = [
    groom.account && { label: `신랑 | ${groom.name}`, account: groom.account },
    groom.father.account && { label: `신랑아버지 | ${groom.father.name}`, account: groom.father.account },
    groom.mother.account && { label: `신랑어머니 | ${groom.mother.name}`, account: groom.mother.account },
  ].filter(Boolean) as { label: string; account: string }[]

  const brideAccounts = [
    bride.account && { label: `신부 | ${bride.name}`, account: bride.account },
    bride.father.account && { label: `신부아버지 | ${bride.father.name}`, account: bride.father.account },
    bride.mother.account && { label: `신부어머니 | ${bride.mother.name}`, account: bride.mother.account },
  ].filter(Boolean) as { label: string; account: string }[]

  return (
    <Section>
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/section/contribution.svg" size={26} className="text-[#feeee0]" />
          <h2 className="font-maruburi text-[17px] font-bold text-[#feeee0]">{copy.section_contribution}</h2>
        </div>
        <p
          className="font-maruburi text-xs font-semibold text-center leading-[18px] text-[#feeee0]"
          dangerouslySetInnerHTML={{ __html: copy.contribution_info }}
        />
        <div className="flex w-full flex-col gap-[13px]">
          {groomAccounts.length > 0 && (
            <CollapsibleCard title="신랑측에게">
              {groomAccounts.map((a) => (
                <AccountEntry
                  key={a.label}
                  label={a.label}
                  account={a.account}
                  onCopy={showToast}
                />
              ))}
            </CollapsibleCard>
          )}
          {brideAccounts.length > 0 && (
            <CollapsibleCard title="신부측에게">
              {brideAccounts.map((a) => (
                <AccountEntry
                  key={a.label}
                  label={a.label}
                  account={a.account}
                  onCopy={showToast}
                />
              ))}
            </CollapsibleCard>
          )}
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
