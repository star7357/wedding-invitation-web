import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false)
      setIsAdmin(false)
      return
    }

    let cancelled = false
    const checkAdmin = async () => {
      if (!supabase) return
      setLoading(true)
      try {
        await supabase.rpc('ensure_profile')
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single()
        if (error) throw error
        if (!cancelled) setIsAdmin(data?.is_admin ?? false)
      } catch {
        if (!cancelled) setIsAdmin(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [userId])

  return { isAdmin, loading }
}
