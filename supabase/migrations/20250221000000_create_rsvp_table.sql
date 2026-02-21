-- RSVP 테이블 생성 (user_id UNIQUE로 1인 1건)
CREATE TABLE IF NOT EXISTS public.rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  attendance TEXT NOT NULL,
  guest_side TEXT,
  guest_count INTEGER,
  transport TEXT,
  meal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "rsvp_read" ON public.rsvp FOR SELECT USING (true);
CREATE POLICY "rsvp_insert" ON public.rsvp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvp_update" ON public.rsvp FOR UPDATE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거 (함수가 이미 있으면 무시)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_updated_at
  BEFORE UPDATE ON public.rsvp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
