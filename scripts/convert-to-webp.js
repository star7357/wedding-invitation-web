import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const originalDir = path.join(__dirname, '../public/assets/images/gallery-original')
const galleryDir = path.join(__dirname, '../public/assets/images/gallery')
const galleryThumbsDir = path.join(__dirname, '../public/assets/images/gallery-thumbs')

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

/** 풀 이미지: 가로 최대 (px), 초과 시 비율 유지 축소 */
const FULL_MAX_WIDTH = 1920
const FULL_WEBP_QUALITY = 85

/** 그리드용 썸네일: 긴 변 기준 (px) */
const THUMB_MAX = 480
const THUMB_WEBP_QUALITY = 80

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext)
}

function collectOriginals() {
  if (!fs.existsSync(originalDir)) {
    console.error(`원본 폴더가 없습니다: ${originalDir}`)
    process.exit(1)
  }

  const byStem = new Map()
  const files = fs
    .readdirSync(originalDir)
    .filter((f) => isImageFile(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  for (const f of files) {
    const stem = path.parse(f).name
    if (byStem.has(stem)) {
      console.warn(`동일 파일명(확장자만 다름) 경고: ${stem} — 마지막 파일 사용 (${f})`)
    }
    byStem.set(stem, path.join(originalDir, f))
  }

  return byStem
}

async function writeWebpVariants(inputPath, outBase) {
  const fullOut = path.join(galleryDir, `${outBase}.webp`)
  const thumbOut = path.join(galleryThumbsDir, `${outBase}.webp`)

  await sharp(inputPath)
    .rotate()
    .resize({
      width: FULL_MAX_WIDTH,
      height: FULL_MAX_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: FULL_WEBP_QUALITY })
    .toFile(fullOut)

  await sharp(inputPath)
    .rotate()
    .resize({
      width: THUMB_MAX,
      height: THUMB_MAX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMB_WEBP_QUALITY })
    .toFile(thumbOut)
}

function removeOrphans(expectedStems) {
  for (const dir of [galleryDir, galleryThumbsDir]) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (!f.toLowerCase().endsWith('.webp')) continue
      const stem = path.parse(f).name
      if (!expectedStems.has(stem)) {
        fs.unlinkSync(path.join(dir, f))
        console.log(`삭제(원본에 없음): ${path.join(path.basename(dir), f)}`)
      }
    }
  }
}

async function main() {
  fs.mkdirSync(galleryDir, { recursive: true })
  fs.mkdirSync(galleryThumbsDir, { recursive: true })

  const byStem = collectOriginals()
  if (byStem.size === 0) {
    console.error(`${originalDir} 에서 이미지를 찾지 못했습니다.`)
    process.exit(1)
  }

  const stems = [...byStem.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  removeOrphans(new Set(stems))

  for (const stem of stems) {
    const inputPath = byStem.get(stem)
    process.stdout.write(`${stem}.webp … `)
    await writeWebpVariants(inputPath, stem)
    console.log('완료')
  }

  console.log(`\n총 ${stems.length}장 — gallery/ 및 gallery-thumbs/ WebP 생성 완료`)
  console.log('다음: node scripts/generate-gallery.js (또는 npm run dev / npm run build)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
