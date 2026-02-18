import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface GuestbookEntry {
  id: string
  user_id: string
  author_name: string
  author_avatar?: string | null
  message: string
  likes: number
  parent_id: string | null
  created_at: string
}

export function useGuestbook(userId: string | undefined) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [heartLikedIds, setHeartLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLikedIds = async () => {
    if (!supabase || !userId) return
    try {
      const { data } = await supabase
        .from('guestbook_likes')
        .select('entry_id')
        .eq('user_id', userId)
      setHeartLikedIds(new Set((data ?? []).map((r) => r.entry_id)))
    } catch {
      setHeartLikedIds(new Set())
    }
  }

  const fetchEntries = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setEntries(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    fetchLikedIds()
  }, [userId])

  const addEntry = async (
    message: string,
    authorName: string,
    uid: string,
    authorAvatar?: string | null,
    parentId?: string | null
  ) => {
    if (!supabase) return
    const row: Record<string, unknown> = {
      user_id: uid,
      author_name: authorName,
      message,
    }
    if (authorAvatar != null) row.author_avatar = authorAvatar
    if (parentId != null) row.parent_id = parentId
    const { error: err } = await supabase.from('guestbook').insert(row)
    if (err) throw err
    await fetchEntries()
  }

  const deleteEntry = async (entryId: string) => {
    if (!supabase) return
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
    const { error: err } = await supabase.from('guestbook').delete().eq('id', entryId)
    if (err) {
      await fetchEntries()
      throw err
    }
    if (userId) await fetchLikedIds()
  }

  const toggleHeart = async (entryId: string) => {
    if (!supabase || !userId) return
    const liked = heartLikedIds.has(entryId)
    setHeartLikedIds((prev) => {
      const next = new Set(prev)
      if (liked) next.delete(entryId)
      else next.add(entryId)
      return next
    })
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, likes: e.likes + (liked ? -1 : 1) } : e
      )
    )
    try {
      if (liked) {
        const { error: err } = await supabase
          .from('guestbook_likes')
          .delete()
          .eq('entry_id', entryId)
          .eq('user_id', userId)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('guestbook_likes')
          .insert({ entry_id: entryId, user_id: userId })
        if (err) throw err
      }
    } catch {
      setHeartLikedIds((prev) => {
        const next = new Set(prev)
        if (liked) next.add(entryId)
        else next.delete(entryId)
        return next
      })
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, likes: e.likes + (liked ? 1 : -1) } : e
        )
      )
    }
  }

  return {
    entries,
    loading,
    error,
    heartLikedIds,
    addEntry,
    deleteEntry,
    toggleHeart,
    refetch: fetchEntries,
  }
}
