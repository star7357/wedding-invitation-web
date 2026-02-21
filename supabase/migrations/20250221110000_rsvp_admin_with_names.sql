-- Admin용 RSVP 조회 (auth.users에서 display_name 조인)
CREATE OR REPLACE FUNCTION public.get_rsvp_admin()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  attendance TEXT,
  guest_side TEXT,
  guest_count INTEGER,
  transport TEXT,
  meal TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.user_id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'nickname',
      u.raw_user_meta_data->>'user_name',
      u.raw_user_meta_data->>'profile_nickname',
      '-'
    )::TEXT AS display_name,
    r.attendance,
    r.guest_side,
    r.guest_count,
    r.transport,
    r.meal,
    r.created_at,
    r.updated_at
  FROM public.rsvp r
  LEFT JOIN auth.users u ON u.id = r.user_id
  ORDER BY r.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_rsvp_admin() TO authenticated;
