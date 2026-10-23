import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(url && key)

/** Cliente de servidor sin sesión. `null` si faltan las variables de entorno (modo demo). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  client ??= createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return client
}
