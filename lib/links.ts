/** Solo http(s): una URL de la base de datos nunca debe poder ser `javascript:`. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
export const DEFAULT_ACCENT = '#D4AF37'

export function safeAccent(value: string | null | undefined): string {
  return value && HEX_RE.test(value) ? value : DEFAULT_ACCENT
}

export function whatsappUrl(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '') ?? ''
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** "https://www.instagram.com/novastudio.gc/" → "@novastudio.gc" */
export function handleFromUrl(value: string): string | null {
  try {
    const first = new URL(value).pathname.split('/').filter(Boolean)[0]
    return first ? `@${first.replace(/^@/, '')}` : null
  } catch {
    return null
  }
}

export function hostFromUrl(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

/** Enlace del pie a tu web, con UTM para saber qué placa te trajo el lead. */
export function brandUrl(base: string, slug: string): string {
  try {
    const url = new URL(base)
    url.searchParams.set('utm_source', 'nfc-portal')
    url.searchParams.set('utm_medium', 'referral')
    url.searchParams.set('utm_campaign', slug)
    return url.toString()
  } catch {
    return base
  }
}

/** Imagen propia (/clients/...) o URL https; cualquier otra cosa se descarta. */
export function safeImage(src: string | null | undefined): string | null {
  return src && (/^\/(?!\/)/.test(src) || src.startsWith('https://')) ? src : null
}

/** Hasta 3 fotos válidas. */
export function photoList(list: string[] | null | undefined): string[] {
  return (list ?? []).filter((src) => safeImage(src)).slice(0, 3)
}
