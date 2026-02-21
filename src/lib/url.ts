/** HTTP URL을 HTTPS로 변환 (Mixed Content 방지) */
export function ensureHttps(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return ''
  return url.replace(/^http:\/\//i, 'https://')
}
