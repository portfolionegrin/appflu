export type ProfileMode = 'portal' | 'direct'

/** Qué acción se muestra como botón principal sólido. */
export type PrimaryAction = 'booking' | 'review'

export type Profile = {
  id: string
  slug: string
  business_name: string
  subtitle: string | null
  /** Minibio bajo el nombre o el logotipo. */
  bio: string | null
  logo_url: string | null
  /** Logotipo horizontal en claro. Si existe, sustituye al logo redondo y al nombre. */
  wordmark_url: string | null
  theme_accent: string | null
  mode: ProfileMode
  primary_action: PrimaryAction
  direct_url: string | null
  google_review_url: string | null
  booking_url: string | null
  booking_label: string | null
  website_url: string | null
  /** Texto de la baldosa de la web, p. ej. "Tienda de ropa". Por defecto "Página web". */
  website_label: string | null
  /** Hasta 3 fotos para la tarjeta de la web (p. ej. prendas de la tienda). */
  website_photos: string[] | null
  /** Logo de la web o tienda para su icono (cuadrado). */
  website_logo_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  whatsapp_phone: string | null
  /** Hasta 3 fotos para la tarjeta de Instagram. */
  instagram_photos: string[] | null
  /** Hasta 3 fotos para la tarjeta de reserva. */
  booking_photos: string[] | null
  is_active: boolean
}

export const TRACK_TARGETS = [
  'google_review',
  'booksy',
  'website',
  'instagram',
  'tiktok',
  'whatsapp',
  'maps',
  'brand',
] as const

export type TrackTarget = (typeof TRACK_TARGETS)[number]

export type EventType = 'scan' | 'click'
