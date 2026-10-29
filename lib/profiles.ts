import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getSupabase, isSupabaseConfigured } from './supabase'
import { DEMO_PROFILES } from './demo-profiles'
import type { Profile } from './types'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const COLUMNS =
  'id, slug, business_name, subtitle, logo_url, wordmark_url, theme_accent, mode, direct_url, google_review_url, booking_url, booking_label, website_url, website_label, website_photos, website_logo_url, instagram_url, tiktok_url, whatsapp_phone, instagram_photos, booking_photos, is_active'

// Caché compartida entre peticiones: un escaneo no espera a la base de datos
// salvo la primera vez cada 60 s. Los cambios en Supabase tardan ≤ 60 s en verse.
const fetchProfile = unstable_cache(
  async (slug: string): Promise<Profile | null> => {
    const { data, error } = await getSupabase()!
      .from('profiles')
      .select(COLUMNS)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle<Profile>()
    if (error) throw new Error(`Supabase: ${error.message}`)
    return data
  },
  ['profile-by-slug'],
  { revalidate: 60, tags: ['profiles'] },
)

/** Perfil activo por slug. Deduplicado por petición (metadata + página). */
export const getProfile = cache(async (slug: string): Promise<Profile | null> => {
  if (!SLUG_RE.test(slug) || slug.length > 64) return null
  if (!isSupabaseConfigured) return DEMO_PROFILES[slug] ?? null
  return fetchProfile(slug)
})
