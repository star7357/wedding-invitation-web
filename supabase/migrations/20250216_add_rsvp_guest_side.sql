-- 기존 rsvp 테이블에 guest_side 컬럼 추가
ALTER TABLE rsvp ADD COLUMN IF NOT EXISTS guest_side TEXT;
