# Wedding Invitation Web

결혼식 초대장 웹 페이지. React + TypeScript + Tailwind + Supabase.

## 기술 스택

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Supabase (Auth, Database)
- 카카오 소셜 로그인

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env` 파일 생성 후 다음 변수 설정:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Authentication > Providers > Kakao 활성화
   - Kakao 개발자 콘솔에서 REST API 키 발급
   - Redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`

### 4. 메타 정보 수정

`public/config/invitation.yaml` 파일을 수정하여 신랑/신부 정보, 일시, 장소, 계좌 등을 입력합니다.

**지도 링크 (모바일 앱 직접 실행):**
- `naver`: `web` URL만 있으면 됨. 앱 실행 시 `venue.name`으로 검색
- `kakao`: `web` URL + `placeId` (또는 web URL에서 자동 추출) 입력 시 카카오맵 앱 실행
- 앱 미설치 시 웹 URL로 자동 fallback

### 5. 이미지 추가

- **Hero**: `public/assets/images/hero.jpg` 추가
- **갤러리**: `public/assets/images/gallery/` 폴더에 이미지 추가 (파일명 순 정렬)

### 6. 실행

```bash
npm run dev
```

## 배포 (Vercel)

1. Vercel에 프로젝트 연결
2. 환경 변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정
3. 빌드 시 `prebuild`가 자동으로 갤러리 이미지 목록을 생성합니다

## 폴더 구조

```
public/
  config/invitation.yaml   # 메타 정보
  assets/images/
    hero.jpg              # Hero 배경
    gallery/              # 갤러리 사진
src/
  components/             # UI 컴포넌트
  config/                 # YAML 로더
  generated/              # 빌드 시 생성 (갤러리 목록)
  hooks/                  # useAuth, useGuestbook, useRsvp
  lib/                    # Supabase 클라이언트
  pages/                  # InvitationPage
```
