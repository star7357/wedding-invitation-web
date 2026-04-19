# 갤러리 원본 이미지

이미지가 회전되어 보이면, 원본 JPG/PNG 파일을 이 폴더에 넣고 아래 명령을 실행하세요:

```bash
npm run gallery:build
```

또는 단계별로:

```bash
node scripts/convert-to-webp.js
node scripts/generate-gallery.js
```

`convert-to-webp.js`는 EXIF 방향을 반영한 뒤, 풀 사이즈 WebP를 `gallery/`에, 그리드용 썸네일 WebP를 `gallery-thumbs/`에 저장합니다. 원본에 없는 기존 WebP는 삭제되어 폴더가 원본 목록과 맞춰집니다.
