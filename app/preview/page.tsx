import type { Metadata } from 'next'
import Link from 'next/link'
import { Portal } from '@/components/portal/Portal'
import { BRAND } from '@/lib/brand'
import { DEMO_PROFILES } from '@/lib/demo-profiles'

export const metadata: Metadata = {
  title: 'Vista previa del portal',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ slug?: string }> }

/**
 * Previsualización con los datos del seed, sin Supabase y sin registrar clics.
 * /preview                 → Atelier Corte & Barba
 * /preview?slug=nova-studio → NOVA Studio
 */
export default async function PreviewPage({ searchParams }: Props) {
  const { slug = 'atelier-corte-barba' } = await searchParams
  const profile = DEMO_PROFILES[slug] ?? DEMO_PROFILES['atelier-corte-barba']

  return (
    <>
      <nav className="relative z-10 mx-auto mt-[max(0.75rem,env(safe-area-inset-top))] flex w-fit gap-1 rounded-full border border-white/10 bg-black/70 p-1 text-[11px] backdrop-blur-md">
        {Object.values(DEMO_PROFILES).map((demo) => (
          <Link
            key={demo.slug}
            href={`/preview?slug=${demo.slug}`}
            className={`rounded-full px-3 py-1 transition-colors ${
              demo.slug === profile.slug ? 'bg-white/15 text-zinc-50' : 'text-zinc-400'
            }`}
          >
            {demo.business_name}
          </Link>
        ))}
      </nav>
      <Portal profile={profile} brand={BRAND} trackingDisabled />
    </>
  )
}
