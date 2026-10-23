import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { after } from 'next/server'
import { Portal } from '@/components/portal/Portal'
import { logEvent } from '@/lib/analytics'
import { BRAND } from '@/lib/brand'
import { safeUrl } from '@/lib/links'
import { getProfile } from '@/lib/profiles'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile((await params).slug)
  if (!profile) return { title: 'Portal no encontrado' }
  return {
    title: `${profile.business_name} · Reseñas y reservas`,
    description: profile.subtitle ?? `Valora y reserva en ${profile.business_name}.`,
    robots: { index: false, follow: false },
  }
}

export default async function PortalPage({ params }: Props) {
  const { slug } = await params
  const profile = await getProfile(slug) // caché de 60 s: no toca Supabase en cada escaneo
  if (!profile) notFound()

  // El escaneo se inserta DESPUÉS de enviar la respuesta: ni el redirect ni el
  // HTML esperan a la base de datos.
  const userAgent = (await headers()).get('user-agent')
  after(() => logEvent({ profileId: profile.id, type: 'scan', userAgent }))

  if (profile.mode === 'direct') {
    const destination = safeUrl(profile.direct_url) ?? safeUrl(profile.google_review_url)
    if (destination) redirect(destination) // 307 desde el servidor
  }

  return <Portal profile={profile} brand={BRAND} />
}
