import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface RsvpEntry {
  id: string
  user_id: string
  attendance: string
  guest_side: string | null
  guest_count: number | null
  transport: string | null
  meal: string | null
  created_at: string
  updated_at: string
}

export function useRsvp(userId: string | undefined) {
  const [entry, setEntry] = useState<RsvpEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = async () => {
    if (!supabase || !userId) {
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('rsvp')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (err) throw err
      setEntry(data)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '오류가 발생했습니다'
      setError(msg)
      console.error('[useRsvp] fetchEntry error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntry()
  }, [userId])

  const upsertRsvp = async (data: {
    attendance: string
    guest_side?: string | null
    guest_count?: number | null
    transport?: string | null
    meal?: string | null
  }) => {
    if (!supabase || !userId) return
    const { error: err } = await supabase.from('rsvp').upsert(
      {
        user_id: userId,
        ...data,
      },
      { onConflict: 'user_id' }
    )
    if (err) throw err
    await fetchEntry()
  }

  return { entry, loading, error, upsertRsvp, refetch: fetchEntry }
}
