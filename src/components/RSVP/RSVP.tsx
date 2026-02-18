import { useState, useEffect } from 'react'
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
  const { entry, loading, error, upsertRsvp } = useRsvp(user?.id)
  const [attendance, setAttendance] = useState('')
  const [guestSide, setGuestSide] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [transport, setTransport] = useState('')
  const [meal, setMeal] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (entry) {
      setAttendance(entry.attendance)
      setGuestSide(entry.guest_side ?? '')
      setGuestCount(entry.guest_count?.toString() ?? '')
      setTransport(entry.transport ?? '')
      setMeal(entry.meal ?? '')
    } else {
      setAttendance('')
      setGuestSide('')
      setGuestCount('')
      setTransport('')
      setMeal('')
    }
  }, [entry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await upsertRsvp({
        attendance,
        guest_side: guestSide || undefined,
        guest_count: guestCount ? parseInt(guestCount, 10) : undefined,
        transport: transport || undefined,
        meal: meal || undefined,
      })
      setShowForm(false)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded-[5px] border border-[#feeee0]/40 bg-[#f7f4f11a] p-2.5 text-sm text-[#feeee0] placeholder:text-[#feeee0]/50'

  const renderRow = (field: (typeof RSVP_FIELDS)[number], value: string | number | null) => (
    <div key={field.key} className="flex items-center gap-3 py-2.5">
      <Icon src={field.icon} size={20} className="text-[#feeee0] shrink-0" />
      <span className="font-maruburi text-sm text-[#feeee0]/80">{field.label}</span>
      <span className="ml-auto font-maruburi text-sm text-[#feeee0]">{value ?? '-'}</span>
    </div>
  )

  // 카드 스타일 (Figma: rounded block, darker brown, subtle shadow)
  const rsvpCardClass =
    'w-full rounded-[5px] bg-[#45352a] px-4 py-4 font-maruburi shadow-[2px_2px_6px_rgba(0,0,0,0.25)]'

  // 1. 로그아웃: 아이콘+라벨 목록 + 로그인 버튼
  if (!user) {
    return (
      <Section>
        <div className="flex flex-col items-center gap-[30px]">
          <div className="flex items-center justify-center gap-1.5">
            <Icon src="/assets/icons/section/rsvp.svg" size={26} className="text-[#feeee0]" />
            <h2 className="font-maruburi text-base font-bold text-[#feeee0]">{config.copy.section_rsvp}</h2>
          </div>

          <div className={rsvpCardClass}>
            <ul className="flex flex-col gap-0">
              {RSVP_FIELDS.map((field) => (
                <li key={field.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Icon src={field.icon} size={20} className="text-[#feeee0] shrink-0" />
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
            className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEA91] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] shadow-[1px_2.5px_4px_#28170d] disabled:opacity-50"
          >
            <img src="/assets/icons/auth/kakaotalk.svg" alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
            {config.copy.rsvp_cta ?? '카카오톡 로그인하여 참석 여부 전달하기'}
          </button>
        </div>
      </Section>
    )
  }

  // 로그인 공통: 헤더
  const SectionHeader = () => (
    <div className="flex items-center justify-center gap-1.5">
      <Icon src="/assets/icons/section/rsvp.svg" size={26} className="text-[#feeee0]" />
      <h2 className="font-maruburi text-base font-bold text-[#feeee0]">{config.copy.section_rsvp}</h2>
    </div>
  )

  // 2. 로그인 + RSVP 작성 전: 목록 + 버튼 (버튼 클릭 시 폼으로)
  const BeforeWriteView = () => (
    <>
      <div className={rsvpCardClass}>
        <ul className="flex flex-col gap-0">
          {RSVP_FIELDS.map((field) => (
            <li key={field.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Icon src={field.icon} size={20} className="text-[#feeee0] shrink-0" />
              <span className="font-maruburi text-sm text-[#feeee0]">{field.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEA91] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] shadow-[1px_2.5px_4px_#28170d]"
      >
        참석 정보 입력하기
      </button>
    </>
  )

  // 3. 로그인 + 폼 (버튼 클릭 후): 입력 폼
  const FormView = () => (
    <form onSubmit={handleSubmit} className={`flex w-full flex-col gap-5 ${rsvpCardClass} py-5`}>
      <div>
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/rsvp/rsvp_visit.svg" size={20} className="text-[#feeee0] shrink-0" />
          <label className="font-maruburi text-sm font-semibold text-[#feeee0]">참석 여부</label>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setAttendance('참석')}
            className={`flex-1 rounded-[5px] px-4 py-2.5 font-maruburi text-sm font-medium transition ${
              attendance === '참석'
                ? 'bg-[#feeee0] text-[#3b291e]'
                : 'border border-[#feeee0]/40 bg-transparent text-[#feeee0]/80'
            }`}
          >
            참석합니다
          </button>
          <button
            type="button"
            onClick={() => setAttendance('불참')}
            className={`flex-1 rounded-[5px] px-4 py-2.5 font-maruburi text-sm font-medium transition ${
              attendance === '불참'
                ? 'bg-[#feeee0] text-[#3b291e]'
                : 'border border-[#feeee0]/40 bg-transparent text-[#feeee0]/80'
            }`}
          >
            참석하지 않습니다
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/rsvp/rsvp_heart.svg" size={20} className="text-[#feeee0] shrink-0" />
          <label className="font-maruburi text-sm font-semibold text-[#feeee0]">하객 측</label>
        </div>
        <select value={guestSide} onChange={(e) => setGuestSide(e.target.value)} className={inputClass}>
          <option value="">선택</option>
          <option value="신랑측">신랑측</option>
          <option value="신부측">신부측</option>
        </select>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/rsvp/rsvp_person.svg" size={20} className="text-[#feeee0] shrink-0" />
          <label className="font-maruburi text-sm font-semibold text-[#feeee0]">참석 인원</label>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGuestCount((n) => Math.max(1, (parseInt(n, 10) || 1) - 1).toString())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#feeee0]/40 text-[#feeee0] hover:bg-[#feeee0]/10"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="min-w-0 flex-1 rounded-[5px] border border-[#feeee0]/40 bg-[#f7f4f11a] p-2.5 text-center text-sm text-[#feeee0] placeholder:text-[#feeee0]/50"
          />
          <span className="shrink-0 text-sm text-[#feeee0]/70">명</span>
          <button
            type="button"
            onClick={() => setGuestCount((n) => ((parseInt(n, 10) || 0) + 1).toString())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#feeee0]/40 text-[#feeee0] hover:bg-[#feeee0]/10"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/rsvp/rsvp_transport.svg" size={20} className="text-[#feeee0] shrink-0" />
          <label className="font-maruburi text-sm font-semibold text-[#feeee0]">이동 수단</label>
        </div>
        <input
          type="text"
          value={transport}
          onChange={(e) => setTransport(e.target.value)}
          placeholder="예: 자가용, 대중교통"
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Icon src="/assets/icons/rsvp/rsvp_meal.svg" size={20} className="text-[#feeee0] shrink-0" />
          <label className="font-maruburi text-sm font-semibold text-[#feeee0]">식사 여부</label>
        </div>
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className={inputClass}>
          <option value="">선택</option>
          <option value="식사">식사</option>
          <option value="비식사">비식사</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => (entry ? setIsEditing(false) : setShowForm(false))}
          className="flex-1 rounded-[5px] border border-[#feeee0]/40 bg-transparent px-4 py-3 font-maruburi text-sm font-semibold text-[#feeee0]"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex flex-1 items-center justify-center rounded-[5px] bg-[#ffea90] px-[13px] py-[17px] font-semibold text-[#3b291e] disabled:opacity-50"
        >
          등록
        </button>
      </div>
    </form>
  )

  // 4. 로그인 + 작성 완료: 제출된 내용 표시 + 수정 버튼
  const CompletedView = () => (
    <>
      <div className={`flex w-full flex-col divide-y divide-[#feeee0]/20 ${rsvpCardClass} py-2`}>
        {renderRow(RSVP_FIELDS[0], entry!.attendance)}
        {renderRow(RSVP_FIELDS[1], entry!.guest_side)}
        {renderRow(RSVP_FIELDS[2], entry!.guest_count != null ? `${entry!.guest_count}명` : null)}
        {renderRow(RSVP_FIELDS[3], entry!.transport)}
        {renderRow(RSVP_FIELDS[4], entry!.meal)}
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#FEEA91] px-[13px] py-[17px] font-maruburi text-sm font-semibold text-[#3b291e] shadow-[1px_2.5px_4px_#28170d]"
      >
        참석 정보 수정하기
      </button>
    </>
  )

  return (
    <Section>
      <div className="flex flex-col items-center gap-[30px]">
        <SectionHeader />

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#feeee0] border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
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
