import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const galleryDir = path.join(__dirname, '../public/assets/images/gallery')
const galleryThumbsDir = path.join(__dirname, '../public/assets/images/gallery-thumbs')
const outputPath = path.join(__dirname, '../public/assets/gallery.json')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

function generateGallery() {
  if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true })
  }

  const files = fs.readdirSync(galleryDir)
  const fullImages = files
    .filter((f) => IMAGE_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext)))
    .sort()
    .map((f) => `/assets/images/gallery/${f}`)

  const thumbs = fullImages.map((full) => {
    const base = path.basename(full)
    const thumbPath = path.join(galleryThumbsDir, base)
    return fs.existsSync(thumbPath) ? `/assets/images/gallery-thumbs/${base}` : full
  })

  const output = { full: fullImages, thumb: thumbs }
  const outputDir = path.dirname(outputPath)
  fs.mkdirSync(outputDir, { recursive: true })

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`Generated gallery.json with ${fullImages.length} images`)
}

generateGallery()
