# 갤러리 원본 이미지

이미지가 회전되어 보이면, 원본 JPG/PNG 파일을 이 폴더에 넣고 아래 명령을 실행하세요:

```bash
node scripts/convert-to-webp.js
node scripts/generate-gallery.js
```

EXIF 방향 정보가 적용된 WebP로 변환되어 `gallery/` 폴더에 저장됩니다.
