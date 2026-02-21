import { useState, useEffect, Fragment } from 'react'
import { Section } from '@/components/layout/Section'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useRsvp } from '@/hooks/useRsvp'
import type { InvitationConfig } from '@/config/invitation'

const RSVP_FIELDS = [
  { key: 'attendance' as const, label: '참석 여부', icon: '/assets/icons/rsvp/rsvp_visit.svg' },
  { key: 'guest_side' as const, label: '하객 측', icon: '/assets/icons/rsvp/rsvp_heart.svg' },
  { key: 'guest_count' as const, label: '참석 인원', icon: '/assets/icons/rsvp/rsvp_person.svg' },
  { key: 'transport' as const, label: '이동 수단', icon: '/assets/icons/rsvp/rsvp_transport.svg' },
  { key: 'meal' as const, label: '식사 여부', icon: '/assets/icons/rsvp/rsvp_meal.svg' },
] as const

interface RSVPProps {
  config: InvitationConfig
}

export function RSVP({ config }: RSVPProps) {
  const { user, signInWithKakao } = useAuth()
  const { entry, loading, error, upsertRsvp, refetch } = useRsvp(user?.id)
  const [attendance, setAttendance] = useState('')
  const [guestSide, setGuestSide] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [transport, setTransport] = useState('')
  const [meal, setMeal] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [guestSideError, setGuestSideError] = useState('')

  const toFormAttendance = (v: string) =>
    v === '참석' || v === '참석할게요' ? '참석할게요' : v === '불참' || v === '참석이 어려워요' ? '참석이 어려워요' : v
  const toDbAttendance = (v: string) => (v === '참석할게요' ? '참석' : v === '참석이 어려워요' ? '불참' : v)
  const toFormGuestSide = (v: string) =>
    v === '신랑측' || v === '신랑 하객' ? '신랑 하객' : v === '신부측' || v === '신부 하객' ? '신부 하객' : v
  const toDbGuestSide = (v: string) => (v === '신랑 하객' ? '신랑측' : v === '신부 하객' ? '신부측' : v)
  const toFormTransport = (v: string) => v || ''
  const toFormMeal = (v: string) =>
    v === '식사' || v === '식사해요' ? '식사해요' : v === '비식사' || v === '식사 안 해요' ? '식사 안 해요' : v === '미정' ? '미정' : v
  const toDbMeal = (v: string) =>
    v === '식사해요' ? '식사' : v === '식사 안 해요' ? '비식사' : v === '미정' ? '미정' : v

  useEffect(() => {
    if (entry) {
      setAttendance(toFormAttendance(entry.attendance))
      setGuestSide(toFormGuestSide(entry.guest_side ?? ''))
      setGuestCount(entry.guest_count?.toString() ?? '1')
      setTransport(toFormTransport(entry.transport ?? ''))
      setMeal(toFormMeal(entry.meal ?? ''))
    } else {
      setAttendance('')
      setGuestSide('')
      setGuestCount('1')
      setTransport('')
      setMeal('')
    }
  }, [entry])

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.nickname ??
    user?.user_metadata?.user_name ??
    user?.user_metadata?.profile_nickname ??
    null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setAttendanceError('')
    setGuestSideError('')

    const isNotAttending = attendance === '참석이 어려워요'
    if (!attendance) {
      setAttendanceError('참석 여부를 선택해 주세요.')
      return
    }
    if (!isNotAttending && !guestSide) {
      setGuestSideError('어느 분의 하객이신지 선택해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      await upsertRsvp({
        attendance: toDbAttendance(attendance) || attendance,
        guest_side: isNotAttending ? null : toDbGuestSide(guestSide) || guestSide || undefined,
        guest_count: isNotAttending ? null : guestCount ? parseInt(guestCount, 10) : undefined,
        transport: isNotAttending ? null : transport || undefined,
        meal: isNotAttending ? null : toDbMeal(meal) || meal || undefined,
        display_name: displayName,
      })
      setShowForm(false)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const optionBtn = (selected: boolean) =>
    selected
      ? 'flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-[5px] px-4 py-2.5 font-maruburi text-sm font-medium bg-[#FEEEE0] text-[#3b291e] transition'
      : 'flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-[5px] px-4 py-2.5 font-maruburi text-sm font-medium border border-[#feeee0]/40 bg-transparent text-[#feeee0] hover:bg-[#feeee0]/5 transition'

  const displayValue = (key: string, value: string | number | null): string => {
    if (value == null || value === '') return '-'
    const v = String(value)
    if (key === 'attendance') return v === '참석' ? '참석할게요' : v === '불참' ? '참석이 어려워요' : v
    if (key === 'guest_side') return v === '신랑측' ? '신랑 하객' : v === '신부측' ? '신부 하객' : v
    if (key === 'meal') return v === '식사' ? '식사해요' : v === '비식사' ? '식사 안 해요' : v
    return v
  }

  if (!user) {
    return (
      <Section>
        <div className="flex w-full flex-col items-center gap-[30px]">
          <div className="flex items-center justify-center gap-1.5">
            <Icon src="/assets/icons/section/rsvp.svg" size={26} className="text-[#feeee0]" />
            <h2 className="font-maruburi text-base font-bold uppercase tracking-wide text-[#feeee0]">
              {config.copy.section_rsvp}
            </h2>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="w-full rounded-[5px] bg-[#f7f4f124] px-4 py-5 font-maruburi">
              <ul className="flex flex-col gap-4">
                {RSVP_FIELDS.map((field) => (
                  <li key={field.key} className="flex items-center gap-2">
                    <Icon src={field.icon} size={14} className="text-[#feeee0] shrink-0" />
                    <span className="font-maruburi text-sm text-[#feeee0]">{field.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!import.meta.env.VITE_SUPABASE_URL) {
                  alert(
                    'Supabase가 설정되지 않았습니다.\n.env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 추가해주세요.'
                  )
                  return
                }
                try {
                  await signInWithKakao()
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err)
                  alert(`카카오 로그인 실패: ${msg}\n\n브라우저 콘솔(F12)에서 자세한 오류를 확인해보세요.`)
                }
              }}
              disabled={!import.meta.env.VITE_SUPABASE_URL}
              className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEA91] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] shadow-[1px_2.5px_4px_#28170d] transition hover:opacity-90 disabled:opacity-50"
            >
              <img src="/assets/icons/auth/kakaotalk.svg" alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
              {config.copy.rsvp_cta ?? '카카오톡 로그인하여 참석 여부 전달하기'}
            </button>
          </div>
        </div>
      </Section>
    )
  }

  const ctaButtonClass =
    'flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEEE0] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] transition hover:opacity-90 disabled:opacity-50'

  const BeforeWriteView = () => (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full rounded-[5px] bg-[#f7f4f124] px-4 py-5 font-maruburi">
        <ul className="flex flex-col gap-4">
          {RSVP_FIELDS.map((field) => (
            <li key={field.key} className="flex items-center gap-2">
              <Icon src={field.icon} size={14} className="text-[#feeee0] shrink-0" />
              <span className="font-maruburi text-sm text-[#feeee0]">{field.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={() => setShowForm(true)} className={ctaButtonClass}>
        참석 정보 입력하기
      </button>
    </div>
  )

  const FormView = () => (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 rounded-[5px] bg-[#f7f4f124] px-4 py-6 font-maruburi"
    >
      <div className="flex flex-col gap-2">
        <label className="font-maruburi text-sm font-medium text-[#feeee0]">참석 가능 여부 *</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setAttendance('참석할게요'); setAttendanceError('') }}
            className={`flex-1 ${optionBtn(attendance === '참석할게요')}`}
          >
            참석할게요
          </button>
          <button
            type="button"
            onClick={() => { setAttendance('참석이 어려워요'); setAttendanceError(''); setGuestSideError('') }}
            className={`flex-1 ${optionBtn(attendance === '참석이 어려워요')}`}
          >
            참석이 어려워요
          </button>
        </div>
        {attendanceError && (
          <p className="font-maruburi text-xs text-red-400">{attendanceError}</p>
        )}
      </div>

      <div className={`flex flex-col gap-2 ${attendance === '참석이 어려워요' ? 'pointer-events-none opacity-50' : ''}`}>
        <label className="font-maruburi text-sm font-medium text-[#feeee0]">어느 분의 하객이신가요? *</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setGuestSide('신랑 하객'); setGuestSideError('') }}
            className={`flex-1 ${optionBtn(guestSide === '신랑 하객')}`}
          >
            신랑 하객
          </button>
          <button
            type="button"
            onClick={() => { setGuestSide('신부 하객'); setGuestSideError('') }}
            className={`flex-1 ${optionBtn(guestSide === '신부 하객')}`}
          >
            신부 하객
          </button>
        </div>
        {guestSideError && (
          <p className="font-maruburi text-xs text-red-400">{guestSideError}</p>
        )}
      </div>

      <div className={`flex flex-col gap-2 ${attendance === '참석이 어려워요' ? 'pointer-events-none opacity-50' : ''}`}>
        <label className="font-maruburi text-sm font-medium text-[#feeee0]">몇 분이 오시나요? (본인 포함)</label>
        <div className="flex h-[42px] items-center gap-2">
          <button
            type="button"
            onClick={() => setGuestCount((n) => Math.max(1, (parseInt(n, 10) || 1) - 1).toString())}
            className={`flex-1 ${optionBtn(false)}`}
          >
            −
          </button>
          <div className="flex min-h-[42px] min-w-0 flex-1 items-center justify-center rounded-[5px] bg-[#FEEEE0] px-4 py-2.5 font-maruburi text-sm font-medium text-[#3b291e]">
            {guestCount || '1'}명
          </div>
          <button
            type="button"
            onClick={() => setGuestCount((n) => ((parseInt(n, 10) || 0) + 1).toString())}
            className={`flex-1 ${optionBtn(false)}`}
          >
            +
          </button>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${attendance === '참석이 어려워요' ? 'pointer-events-none opacity-50' : ''}`}>
        <label className="font-maruburi text-sm font-medium text-[#feeee0]">이동 수단</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTransport('자가용')}
            className={`flex-1 ${optionBtn(transport === '자가용')}`}
          >
            자가용
          </button>
          <button
            type="button"
            onClick={() => setTransport('대중교통')}
            className={`flex-1 ${optionBtn(transport === '대중교통')}`}
          >
            대중교통
          </button>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${attendance === '참석이 어려워요' ? 'pointer-events-none opacity-50' : ''}`}>
        <label className="font-maruburi text-sm font-medium text-[#feeee0]">식사를 하실 예정이신가요?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMeal('식사해요')}
            className={`flex-1 ${optionBtn(meal === '식사해요')}`}
          >
            식사해요
          </button>
          <button
            type="button"
            onClick={() => setMeal('식사 안 해요')}
            className={`flex-1 ${optionBtn(meal === '식사 안 해요')}`}
          >
            식사 안 해요
          </button>
          <button
            type="button"
            onClick={() => setMeal('미정')}
            className={`flex-1 ${optionBtn(meal === '미정')}`}
          >
            미정
          </button>
        </div>
      </div>

      <div className="flex min-h-[42px] gap-2 pt-1">
        <button
          type="button"
          onClick={() => (entry ? setIsEditing(false) : setShowForm(false))}
          className="flex min-h-[42px] flex-1 items-center justify-center rounded-[5px] border border-[#feeee0]/40 bg-transparent px-4 py-3 font-maruburi text-sm font-semibold text-[#feeee0] hover:bg-[#feeee0]/5"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-[42px] flex-1 items-center justify-center rounded-[5px] bg-[#FEEEE0] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] transition hover:opacity-90 disabled:opacity-50"
        >
          참석 정보 저장하기
        </button>
      </div>
    </form>
  )

  const CompletedView = () => (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full rounded-[5px] bg-[#f7f4f124] px-4 py-5 font-maruburi">
        <div className="grid grid-cols-[auto_1fr] grid-rows-5 gap-x-8 gap-y-[10px] items-center">
          {RSVP_FIELDS.map((field) => {
            const isNotAttending = entry!.attendance === '불참'
            const value =
              isNotAttending && field.key !== 'attendance'
                ? null
                : field.key === 'guest_count'
                  ? entry!.guest_count != null
                    ? `${entry!.guest_count}명`
                    : null
                  : entry![field.key as keyof typeof entry]
            return (
              <Fragment key={field.key}>
                <div className="flex items-center gap-2">
                  <Icon src={field.icon} size={14} className="text-[#feeee0] shrink-0" />
                  <span className="whitespace-nowrap font-maruburi text-sm font-medium text-[#feeee0]">{field.label}</span>
                </div>
                <div className="font-maruburi text-sm font-medium text-[#feeee0] text-left">
                  {displayValue(field.key, value)}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
      <button type="button" onClick={() => setIsEditing(true)} className={ctaButtonClass}>
        참석 정보 수정하기
      </button>
    </div>
  )

  return (
    <Section>
      <div className="flex w-full flex-col items-center gap-[30px]">
        <div className="flex items-center justify-center gap-1.5">
          <Icon src="/assets/icons/section/rsvp.svg" size={26} className="text-[#feeee0]" />
          <h2 className="font-maruburi text-base font-bold uppercase tracking-wide text-[#feeee0]">
            {config.copy.section_rsvp}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#feeee0] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-[5px] bg-[#FEEEE0] px-[13px] py-2 font-maruburi text-sm font-semibold text-[#3b291e] hover:opacity-90"
            >
              다시 시도
            </button>
          </div>
        ) : entry && !isEditing ? (
          CompletedView()
        ) : entry && isEditing ? (
          FormView()
        ) : showForm ? (
          FormView()
        ) : (
          BeforeWriteView()
        )}
      </div>
    </Section>
  )
}
