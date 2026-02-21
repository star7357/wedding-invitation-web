import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'

interface RsvpRow {
  id: string
  user_id: string
  display_name: string
  attendance: string
  guest_side: string | null
  guest_count: number | null
  transport: string | null
  meal: string | null
  created_at: string
}

type FilterKey = 'attendance' | 'guest_side' | 'transport' | 'meal'

const FILTER_GROUPS: { key: FilterKey; options: { label: string; value: string }[] }[] = [
  { key: 'attendance', options: [{ label: '참석', value: '참석' }, { label: '불참', value: '불참' }] },
  { key: 'guest_side', options: [{ label: '신랑', value: '신랑측' }, { label: '신부', value: '신부측' }] },
  { key: 'transport', options: [{ label: '🚗', value: '자가용' }, { label: '🚌', value: '대중교통' }] },
  { key: 'meal', options: [{ label: '식사', value: '식사' }, { label: '비식', value: '비식사' }, { label: '미정', value: '미정' }] },
]

const isLocalhost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

function AdminPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin(user?.id)
  const [rsvpList, setRsvpList] = useState<RsvpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    attendance: [],
    guest_side: [],
    transport: [],
    meal: [],
  })

  const canAccessAdmin = isLocalhost() || (user && isAdmin)

  useEffect(() => {
    const client = supabase
    if (!client) return
    if (!isLocalhost() && !user) return

    const fetchRsvp = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await client
          .from('rsvp')
          .select('id, user_id, display_name, attendance, guest_side, guest_count, transport, meal, created_at, updated_at')
          .order('created_at', { ascending: false })
        if (err) throw err
        setRsvpList(
          (data ?? []).map((r) => ({ ...r, display_name: r.display_name ?? '-' })) as RsvpRow[]
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }
    fetchRsvp()
  }, [user])

  const filteredList = useMemo(() => {
    return rsvpList.filter((row) => {
      if (filters.attendance.length > 0 && !filters.attendance.includes(row.attendance)) return false
      if (filters.guest_side.length > 0 && !filters.guest_side.includes(row.guest_side ?? '')) return false
      if (filters.transport.length > 0 && !filters.transport.includes(row.transport ?? '')) return false
      if (filters.meal.length > 0 && !filters.meal.includes(row.meal ?? '')) return false
      return true
    })
  }, [rsvpList, filters])

  const totalAttendees = rsvpList
    .filter((r) => r.attendance === '참석')
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)
  const mealCount = rsvpList
    .filter((r) => r.attendance === '참석' && r.meal === '식사')
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)
  const parkingCount = rsvpList.filter(
    (r) => r.attendance === '참석' && r.transport === '자가용'
  ).length

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => {
      const arr = prev[key]
      const group = FILTER_GROUPS.find((g) => g.key === key)
      const allValues = group?.options.map((o) => o.value) ?? []

      let next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      if (allValues.length > 0 && allValues.every((v) => next.includes(v))) {
        next = []
      }
      return { ...prev, [key]: next }
    })
  }

  const displayValueShort = (key: string, value: string | number | null): string => {
    if (value == null || value === '') return '-'
    const v = String(value)
    if (key === 'attendance') return v === '참석' ? '참석' : v === '불참' ? '불참' : v
    if (key === 'guest_side') return v === '신랑측' ? '신랑' : v === '신부측' ? '신부' : v
    if (key === 'meal') return v === '식사' ? '식사' : v === '비식사' ? '비식' : v
    if (key === 'transport') return v === '자가용' ? '🚗' : v === '대중교통' ? '🚌' : v
    return v
  }

  if (!isLocalhost() && (authLoading || adminLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-margin)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  if (!canAccessAdmin) {
    if (!user) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-margin)] px-4">
          <p className="font-maruburi text-base text-[var(--color-primary)]">로그인이 필요합니다.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-[5px] bg-[var(--color-primary)] px-6 py-2.5 font-maruburi text-sm font-medium text-white"
          >
            홈으로
          </button>
        </div>
      )
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-margin)] px-4">
        <p className="font-maruburi text-base text-[var(--color-primary)]">접근 권한이 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-[5px] bg-[var(--color-primary)] px-6 py-2.5 font-maruburi text-sm font-medium text-white"
        >
          홈으로
        </button>
      </div>
    )
  }

  return (
    <MobileFrame>
      <div className="flex min-h-dvh w-full flex-col gap-6 px-4 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="font-maruburi text-lg font-bold text-[#feeee0]">RSVP 현황</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-[5px] border border-[#f7f4f1]/40 px-3 py-1.5 font-maruburi text-xs text-[#feeee0]"
            >
              청첩장
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-[5px] border border-[#f7f4f1]/40 px-3 py-1.5 font-maruburi text-xs text-[#feeee0]"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 현황판 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[8px] bg-[#f7f4f124] p-4 text-center">
            <p className="font-maruburi text-xs text-[#feeee0]/80">참석 하객</p>
            <p className="mt-1 font-maruburi text-2xl font-bold text-[#feeee0]">{totalAttendees}명</p>
          </div>
          <div className="rounded-[8px] bg-[#f7f4f124] p-4 text-center">
            <p className="font-maruburi text-xs text-[#feeee0]/80">식사 인원</p>
            <p className="mt-1 font-maruburi text-2xl font-bold text-[#feeee0]">{mealCount}명</p>
          </div>
          <div className="rounded-[8px] bg-[#f7f4f124] p-4 text-center">
            <p className="font-maruburi text-xs text-[#feeee0]/80">주차 대수</p>
            <p className="mt-1 font-maruburi text-2xl font-bold text-[#feeee0]">{parkingCount}대</p>
          </div>
        </div>

        {/* RSVP 목록 */}
        <div>
          <h2 className="mb-3 font-maruburi text-sm font-semibold text-[#feeee0]">참석 목록</h2>

          {/* 필터 토글 - 한 줄 */}
          <div className="mb-3 flex flex-nowrap items-center gap-x-2 overflow-x-auto pb-1">
            {FILTER_GROUPS.map((group, i) => (
              <div key={group.key} className="flex shrink-0 items-center gap-0.5">
                {i > 0 && <span className="text-[#f7f4f1]/30">|</span>}
                {group.options.map((opt) => {
                  const isActive = filters[group.key].includes(opt.value)
                  return (
                    <button
                      key={`${group.key}-${opt.value}`}
                      type="button"
                      onClick={() => toggleFilter(group.key, opt.value)}
                      className={`shrink-0 rounded px-1.5 py-0.5 font-maruburi text-xs transition ${
                        isActive
                          ? 'bg-[#FEEEE0] text-[#3b291e]'
                          : 'text-[#feeee0]/70 hover:bg-[#f7f4f1]/10 hover:text-[#feeee0]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#feeee0] border-t-transparent" />
            </div>
          ) : error ? (
            <p className="font-maruburi text-sm text-red-400">{error}</p>
          ) : filteredList.length === 0 ? (
            <p className="font-maruburi text-sm text-[#feeee0]/60">
              {rsvpList.length === 0 ? '아직 응답이 없습니다.' : '필터 조건에 맞는 응답이 없습니다.'}
            </p>
          ) : (
            <div className="rounded-[8px] border border-[#f7f4f1]/30 overflow-hidden">
              <table className="w-full table-fixed text-left font-maruburi text-xs">
                <thead>
                  <tr className="border-b border-[#f7f4f1]/30 bg-[#f7f4f118]">
                    <th className="w-[22%] px-2 py-2 font-medium text-[#feeee0] truncate">이름</th>
                    <th className="w-[10%] px-1 py-2 font-medium text-[#feeee0]">참석</th>
                    <th className="w-[10%] px-1 py-2 font-medium text-[#feeee0]">측</th>
                    <th className="w-[8%] px-1 py-2 font-medium text-[#feeee0]">인원</th>
                    <th className="w-[10%] px-1 py-2 font-medium text-[#feeee0]">이동</th>
                    <th className="w-[12%] px-1 py-2 font-medium text-[#feeee0]">식사</th>
                    <th className="w-[12%] px-2 py-2 font-medium text-[#feeee0]">일자</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((row) => (
                    <tr key={row.id} className="border-b border-[#f7f4f1]/20 last:border-0">
                      <td className="px-2 py-2 font-medium text-[#feeee0] truncate" title={row.display_name || '-'}>
                        {row.display_name || '-'}
                      </td>
                      <td className="px-1 py-2 text-[#feeee0]">{displayValueShort('attendance', row.attendance)}</td>
                      <td className="px-1 py-2 text-[#feeee0]">{displayValueShort('guest_side', row.guest_side)}</td>
                      <td className="px-1 py-2 text-[#feeee0]">{row.guest_count ?? '-'}</td>
                      <td className="px-1 py-2 text-[#feeee0]">{displayValueShort('transport', row.transport)}</td>
                      <td className="px-1 py-2 text-[#feeee0]">{displayValueShort('meal', row.meal)}</td>
                      <td className="px-2 py-2 text-[#feeee0]/80">
                        {new Date(row.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  )
}

export default AdminPage
