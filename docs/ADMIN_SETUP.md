# Admin 페이지 설정 가이드

## 1. DB 마이그레이션 실행

Supabase 대시보드 → SQL Editor에서 아래 마이그레이션을 순서대로 실행하세요.

1. `supabase/migrations/20250221100000_create_profiles.sql`
2. `supabase/migrations/20250221110000_rsvp_admin_with_names.sql` (이름 표시용 RPC)

또는 Supabase CLI 사용 시:

```bash
supabase db push
```

## 2. 첫 번째 Admin 계정 지정

1. 카카오로 로그인한 뒤, Supabase 대시보드 → Authentication → Users에서 해당 사용자의 **User UID**를 복사합니다.
2. SQL Editor에서 실행:

```sql
-- profiles에 행이 없으면 먼저 생성
INSERT INTO public.profiles (id, is_admin)
VALUES ('여기에-User-UID-붙여넣기', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

## 3. 접근 방법

- **청첩장 페이지** (`/`)에서 로그인 후, admin 계정으로는 "admin 페이지 이동하기" 버튼이 표시됩니다.
- 또는 직접 `/admin` URL로 접속 (로그인 + is_admin=true 필요).

## 4. Admin 페이지 기능

- **현황판**: 참석 하객 수, 식사 인원, 주차 인원
- **참석 목록**: RSVP 응답 전체 테이블
