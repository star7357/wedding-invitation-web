import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'

interface RsvpRow {
  id: string
  user_id: string
  attendance: string
  guest_side: string | null
  guest_count: number | null
  transport: string | null
  meal: string | null
  created_at: string
}

function AdminPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin(user?.id)
  const [rsvpList, setRsvpList] = useState<RsvpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client || !user) return
    const fetchRsvp = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await client
          .from('rsvp')
          .select('*')
          .order('created_at', { ascending: false })
        if (err) throw err
        setRsvpList(data ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }
    fetchRsvp()
  }, [user])

  const totalAttendees = rsvpList
    .filter((r) => r.attendance === '참석')
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)
  const mealCount = rsvpList
    .filter((r) => r.attendance === '참석' && r.meal === '식사')
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)
  const parkingCount = rsvpList
    .filter((r) => r.attendance === '참석' && r.transport === '자가용')
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)

  const displayValue = (key: string, value: string | number | null): string => {
    if (value == null || value === '') return '-'
    const v = String(value)
    if (key === 'attendance') return v === '참석' ? '참석할게요' : v === '불참' ? '참석이 어려워요' : v
    if (key === 'guest_side') return v === '신랑측' ? '신랑 하객' : v === '신부측' ? '신부 하객' : v
    if (key === 'meal') return v === '식사' ? '식사해요' : v === '비식사' ? '식사 안 해요' : v
    if (key === 'transport') return v === '자가용' ? '자가용' : v === '대중교통' ? '대중교통' : v
    return v
  }

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-margin)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

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

  if (!isAdmin) {
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
            <p className="font-maruburi text-xs text-[#feeee0]/80">주차 인원</p>
            <p className="mt-1 font-maruburi text-2xl font-bold text-[#feeee0]">{parkingCount}명</p>
          </div>
        </div>

        {/* RSVP 목록 */}
        <div>
          <h2 className="mb-3 font-maruburi text-sm font-semibold text-[#feeee0]">참석 목록</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#feeee0] border-t-transparent" />
            </div>
          ) : error ? (
            <p className="font-maruburi text-sm text-red-400">{error}</p>
          ) : rsvpList.length === 0 ? (
            <p className="font-maruburi text-sm text-[#feeee0]/60">아직 응답이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto rounded-[8px] border border-[#f7f4f1]/30">
              <table className="w-full min-w-[480px] text-left font-maruburi text-sm">
                <thead>
                  <tr className="border-b border-[#f7f4f1]/30 bg-[#f7f4f118]">
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">참석</th>
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">측</th>
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">인원</th>
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">이동</th>
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">식사</th>
                    <th className="px-3 py-2.5 font-medium text-[#feeee0]">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvpList.map((row) => (
                    <tr key={row.id} className="border-b border-[#f7f4f1]/20 last:border-0">
                      <td className="px-3 py-2.5 text-[#feeee0]">
                        {displayValue('attendance', row.attendance)}
                      </td>
                      <td className="px-3 py-2.5 text-[#feeee0]">
                        {displayValue('guest_side', row.guest_side)}
                      </td>
                      <td className="px-3 py-2.5 text-[#feeee0]">
                        {row.guest_count ?? '-'}
                      </td>
                      <td className="px-3 py-2.5 text-[#feeee0]">
                        {displayValue('transport', row.transport)}
                      </td>
                      <td className="px-3 py-2.5 text-[#feeee0]">
                        {displayValue('meal', row.meal)}
                      </td>
                      <td className="px-3 py-2.5 text-[#feeee0]/80">
                        {new Date(row.created_at).toLocaleDateString('ko-KR')}
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
