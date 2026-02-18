-- Guestbook 테이블
CREATE TABLE IF NOT EXISTS guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  message TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES guestbook(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Guestbook 좋아요 (1인 1하트)
CREATE TABLE IF NOT EXISTS guestbook_likes (
  entry_id UUID NOT NULL REFERENCES guestbook(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, user_id)
);

-- RSVP 테이블 (user_id UNIQUE로 1인 1건)
CREATE TABLE IF NOT EXISTS rsvp (
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

-- RLS 정책
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guestbook_read" ON guestbook FOR SELECT USING (true);
CREATE POLICY "guestbook_insert" ON guestbook FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "guestbook_update" ON guestbook FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "guestbook_delete" ON guestbook FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "guestbook_likes_read" ON guestbook_likes FOR SELECT USING (true);
CREATE POLICY "guestbook_likes_insert" ON guestbook_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "guestbook_likes_delete" ON guestbook_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "rsvp_read" ON rsvp FOR SELECT USING (true);
CREATE POLICY "rsvp_insert" ON rsvp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvp_update" ON rsvp FOR UPDATE USING (auth.uid() = user_id);

-- guestbook.likes 동기화
CREATE OR REPLACE FUNCTION sync_guestbook_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guestbook SET likes = (SELECT count(*) FROM guestbook_likes WHERE entry_id = NEW.entry_id) WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guestbook SET likes = (SELECT count(*) FROM guestbook_likes WHERE entry_id = OLD.entry_id) WHERE id = OLD.entry_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guestbook_likes_sync
  AFTER INSERT OR DELETE ON guestbook_likes
  FOR EACH ROW
  EXECUTE FUNCTION sync_guestbook_likes();

-- rsvp updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_updated_at
  BEFORE UPDATE ON rsvp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
