import { after } from 'next/server'
import { logEvent } from '@/lib/analytics'
import { TRACK_TARGETS, type TrackTarget } from '@/lib/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Recibe clics desde navigator.sendBeacon (text/plain) o fetch keepalive.
 * Body: {"p": "<profile uuid>", "t": "<target>"}
 * Responde 204 al instante; el insert en Supabase corre después con after().
 */
export async function POST(request: Request) {
  // sendBeacon solo sale de nuestra propia página: rechaza envíos de otras webs.
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response(null, { status: 403 })
  }

  const raw = await request.text()
  if (raw.length > 256) return new Response(null, { status: 413 })

  let body: { p?: unknown; t?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }

  const { p: profileId, t: target } = body
  if (
    typeof profileId !== 'string' ||
    !UUID_RE.test(profileId) ||
    !TRACK_TARGETS.includes(target as TrackTarget)
  ) {
    return new Response(null, { status: 400 })
  }

  const userAgent = request.headers.get('user-agent')
  after(() =>
    logEvent({ profileId, type: 'click', target: target as TrackTarget, userAgent }),
  )

  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
}
