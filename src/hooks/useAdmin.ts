import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false)
      return
    }

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
        setIsAdmin(data?.is_admin ?? false)
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [userId])

  return { isAdmin, loading }
}
