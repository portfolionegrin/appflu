import 'server-only'
import { getSupabase } from './supabase'
import type { EventType, TrackTarget } from './types'

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

// Previsualizadores de enlaces (WhatsApp, Telegram, Slack...) y rastreadores:
// no son escaneos reales y no deben inflar las métricas.
const BOT_RE =
  /(?<!cu)bot(?:\b|\/)|crawl|spider|slurp|preview|facebookexternalhit|meta-externalagent|whatsapp\/|embedly|vercel|lighthouse|headless|curl|wget|python|axios|node-fetch|go-http/i

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_RE.test(userAgent)
}

/**
 * Resume el user-agent a "SO · Navegador" + tipo de dispositivo.
 * Nunca guardamos la cadena completa ni la IP: no sirve para identificar a nadie.
 */
export function summarizeUserAgent(ua: string): { summary: string; device: DeviceType } {
  const device: DeviceType = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|iPod|Android/i.test(ua)
      ? 'mobile'
      : /Windows|Macintosh|X11|CrOS/i.test(ua)
        ? 'desktop'
        : 'unknown'

  const os = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /CrOS/i.test(ua)
            ? 'ChromeOS'
            : /Linux/i.test(ua)
              ? 'Linux'
              : 'Otro'

  const browser = /Instagram/i.test(ua)
    ? 'Instagram'
    : /FBAN|FBAV/i.test(ua)
      ? 'Facebook'
      : /TikTok|musical_ly|BytedanceWebview/i.test(ua)
        ? 'TikTok'
        : /SamsungBrowser/i.test(ua)
          ? 'Samsung'
          : /EdgiOS|EdgA|Edg\//i.test(ua)
            ? 'Edge'
            : /FxiOS|Firefox/i.test(ua)
              ? 'Firefox'
              : /CriOS|Chrome/i.test(ua)
                ? 'Chrome'
                : /Safari/i.test(ua)
                  ? 'Safari'
                  : 'Otro'

  return { summary: `${os} · ${browser}`, device }
}

/** Inserta un evento. Nunca lanza: la analítica jamás debe romper un escaneo. */
export async function logEvent(input: {
  profileId: string
  type: EventType
  target?: TrackTarget
  userAgent: string | null
}): Promise<void> {
  const supabase = getSupabase()
  if (!supabase || isBot(input.userAgent)) return

  const { summary, device } = summarizeUserAgent(input.userAgent!)
  try {
    const { error } = await supabase.from('analytics_events').insert({
      profile_id: input.profileId,
      event_type: input.type,
      target: input.type === 'click' ? input.target : null,
      user_agent: summary,
      device_type: device,
    })
    if (error) console.error('[analytics] insert failed:', error.message)
  } catch (err) {
    console.error('[analytics] insert failed:', err)
  }
}
