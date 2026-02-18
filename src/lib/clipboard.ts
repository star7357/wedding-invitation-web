/**
 * 모바일 포함 크로스 브라우저 복사
 * navigator.clipboard 실패 시 execCommand 폴백
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // clipboard API 실패 시 폴백
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;boxShadow:none;background:transparent;opacity:0;'
  textarea.setAttribute('readonly', '')
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    document.body.removeChild(textarea)
    return false
  }
}
