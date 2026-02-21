-- rsvp 테이블에 display_name 컬럼 추가 (RSVP 제출 시 카카오 프로필명 저장)
ALTER TABLE public.rsvp ADD COLUMN IF NOT EXISTS display_name TEXT;
