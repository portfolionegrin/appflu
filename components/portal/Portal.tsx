import type { CSSProperties, ReactNode } from 'react'
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronRight, Globe, Nfc, ShoppingBag, Star } from 'lucide-react'
import type { Profile, TrackTarget } from '@/lib/types'
import { brandUrl, handleFromUrl, hostFromUrl, photoList, safeAccent, safeUrl, whatsappUrl } from '@/lib/links'
import { GoogleIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './BrandIcons'
import { TrackedLink } from './TrackedLink'

export type Brand = { name: string; url: string }

type Props = {
  profile: Profile
  brand: Brand
  /** En /preview los clics no se registran. */
  trackingDisabled?: boolean
}

type Tile = { track: TrackTarget; href: string; label: string; detail: string; icon: ReactNode }

/** Tarjeta grande con hasta 3 fotos (Instagram, tienda...). */
type Feature = Tile & { cta: string; iconClass: string; photos: string[]; portrait: boolean }

const PHOTO_COLS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3']

function websiteIcon(label: string | null) {
  const Icon = /tienda|shop|store/i.test(label ?? '') ? ShoppingBag : Globe
  return <Icon className="size-[18px]" strokeWidth={1.8} />
}

/** Los enlaces con fotos salen como tarjeta grande; el resto, como baldosa del bento grid. */
function buildLinks(profile: Profile): { features: Feature[]; tiles: Tile[] } {
  const features: Feature[] = []
  const tiles: Tile[] = []
  const website = safeUrl(profile.website_url)
  const instagram = safeUrl(profile.instagram_url)
  const tiktok = safeUrl(profile.tiktok_url)
  const whatsapp = whatsappUrl(profile.whatsapp_phone)
  const instagramPhotos = photoList(profile.instagram_photos)
  const websitePhotos = photoList(profile.website_photos)

  if (instagram && instagramPhotos.length > 0) {
    features.push({
      track: 'instagram',
      href: instagram,
      label: handleFromUrl(instagram) ?? 'Instagram',
      detail: 'Instagram · Nuestros trabajos',
      icon: <InstagramIcon className="size-[18px]" strokeWidth={2} />,
      iconClass: 'ig-gradient text-white',
      cta: 'Seguir',
      photos: instagramPhotos,
      portrait: true,
    })
  }
  if (website && websitePhotos.length > 0) {
    features.push({
      track: 'website',
      href: website,
      label: profile.website_label || 'Página web',
      detail: hostFromUrl(website),
      icon: websiteIcon(profile.website_label),
      iconClass: 'bg-accent/10 text-accent ring-1 ring-accent/25 ring-inset',
      cta: 'Visitar',
      photos: websitePhotos,
      portrait: false,
    })
  }

  if (website && websitePhotos.length === 0) {
    tiles.push({ track: 'website', href: website, label: profile.website_label || 'Página web', detail: hostFromUrl(website), icon: websiteIcon(profile.website_label) })
  }
  if (instagram && instagramPhotos.length === 0) {
    tiles.push({ track: 'instagram', href: instagram, label: 'Instagram', detail: handleFromUrl(instagram) ?? 'Síguenos', icon: <InstagramIcon className="size-[18px]" /> })
  }
  if (tiktok) {
    tiles.push({ track: 'tiktok', href: tiktok, label: 'TikTok', detail: handleFromUrl(tiktok) ?? 'Síguenos', icon: <TikTokIcon className="size-4" /> })
  }
  if (whatsapp) {
    tiles.push({ track: 'whatsapp', href: whatsapp, label: 'WhatsApp', detail: 'Escríbenos', icon: <WhatsAppIcon className="size-[17px]" /> })
  }
  return { features, tiles }
}

export function Portal({ profile, brand, trackingDisabled }: Props) {
  const reviewUrl = safeUrl(profile.google_review_url)
  const bookingUrl = safeUrl(profile.booking_url)
  const bookingPhotos = photoList(profile.booking_photos)
  const { features, tiles } = buildLinks(profile)
  const link = (track: TrackTarget) => ({ profileId: profile.id, track, trackingDisabled })

  return (
    <main
      className="relative isolate mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pt-[max(2.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] short:pt-[max(1.25rem,env(safe-area-inset-top))]"
      style={{ '--accent': safeAccent(profile.theme_accent) } as CSSProperties}
    >
      <div aria-hidden className="portal-backdrop pointer-events-none fixed inset-0 -z-10" />

      {/* 1 · Header del local */}
      <header className="flex flex-col items-center text-center">
        <div className="relative size-[84px] short:size-16">
          <div className="logo-ring logo-spin absolute -inset-[1.5px] rounded-full opacity-90" />
          <div className="relative grid size-full place-items-center overflow-hidden rounded-full bg-zinc-950 shadow-[inset_0_0_0_1px_rgb(0_0_0)]">
            {profile.logo_url ? (
              // <img> y no next/image: logos de cualquier dominio, sin pasar por el optimizador
              <img
                src={profile.logo_url}
                alt={`Logo de ${profile.business_name}`}
                width={84}
                height={84}
                fetchPriority="high"
                className="size-full object-cover"
              />
            ) : (
              <span className="font-display text-[2.4rem] font-semibold leading-none text-accent short:text-[1.9rem]">
                {profile.business_name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <h1 className="mt-4 font-display text-[2rem] font-semibold short:mt-3 short:text-[1.7rem] leading-[1.05] tracking-[-0.01em] text-zinc-50 text-balance">
          {profile.business_name}
        </h1>
        {profile.subtitle && <p className="mt-1.5 text-[13px] text-zinc-400">{profile.subtitle}</p>}

        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full short:mt-2.5 border border-white/[0.08] bg-white/[0.04] py-1 pr-2.5 pl-2 text-[11px] font-medium tracking-wide text-zinc-300">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          Perfil verificado
          <BadgeCheck className="size-3.5 text-accent" strokeWidth={2} />
        </p>
      </header>

      <div className="mt-7 flex flex-col gap-3 short:mt-5 short:gap-2.5">
        {/* 2 · CTA primario: reseña en Google */}
        {reviewUrl && (
          <TrackedLink
            href={reviewUrl}
            {...link('google_review')}
            className="review-border group relative block rounded-[28px] p-px transition-transform duration-150 active:scale-[0.985]"
          >
            <div className="relative overflow-hidden rounded-[27px] bg-zinc-900/85 px-5 pt-4 pb-5 backdrop-blur-md short:pt-3.5 short:pb-4">
              <span aria-hidden className="review-sheen sheen pointer-events-none absolute inset-0 -translate-x-full" />

              <div className="relative flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_4px_14px_-4px_rgb(0_0_0/0.6)]">
                  <GoogleIcon className="size-[22px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex gap-0.5 text-accent" aria-label="5 estrellas">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className="star size-[17px]"
                        fill="currentColor"
                        strokeWidth={0}
                        style={{ animationDelay: `${120 + i * 90}ms, ${1200 + i * 140}ms` }}
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium tracking-wide text-zinc-400">Reseñas de Google</p>
                </div>
              </div>

              <p className="relative mt-4 font-display text-[1.6rem] font-semibold leading-[1.08] text-zinc-50 text-balance short:mt-3 short:text-[1.4rem]">
                ¿Te ha gustado la experiencia?
              </p>
              <p className="relative mt-1 text-[15px] text-zinc-300">
                Valóranos en <span className="font-semibold text-accent">10 segundos</span>.
              </p>

              <span className="relative mt-4 flex h-12 short:mt-3 short:h-11 items-center justify-center gap-1.5 rounded-2xl bg-accent text-[15px] font-semibold text-zinc-950 shadow-[0_10px_28px_-10px_var(--accent)]">
                Dejar mi reseña
                <ArrowUpRight className="size-[18px] transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5" strokeWidth={2.2} />
              </span>
            </div>
          </TrackedLink>
        )}

        {/* 3 · CTA secundario de alta intención: reserva */}
        {bookingUrl && (
          <TrackedLink
            href={bookingUrl}
            {...link('booksy')}
            className="group block overflow-hidden rounded-2xl border border-accent/30 bg-zinc-900/80 backdrop-blur-md transition-transform duration-150 active:scale-[0.985]"
          >
            {bookingPhotos.length > 0 && (
              <span className={`relative grid gap-0.5 ${PHOTO_COLS[bookingPhotos.length]}`}>
                {bookingPhotos.map((src) => (
                  // <img> y no next/image: fotos ya optimizadas, sin pasar por el optimizador
                  <img key={src} src={src} alt="" width={360} height={300} decoding="async" className="aspect-[4/3] w-full object-cover" />
                ))}
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-zinc-900/90 to-transparent" />
                <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-100 backdrop-blur-sm">
                  Reserva online · 24 h
                </span>
              </span>
            )}
            <span className="flex min-h-16 items-center gap-3.5 px-4 py-2.5 short:min-h-14">
              {hostFromUrl(bookingUrl).endsWith('booksy.com') ? (
                <img src="/brands/booksy.png" alt="Booksy" width={40} height={40} className="size-10 shrink-0 rounded-xl" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/25 ring-inset">
                  <CalendarDays className="size-5" strokeWidth={1.8} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug font-semibold text-balance text-zinc-50">
                  {profile.booking_label || 'Reservar próxima cita'}
                </span>
                <span className="block text-[12px] text-zinc-500">Elige día y hora · sin llamadas</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-zinc-500 transition-transform group-active:translate-x-0.5" />
            </span>
          </TrackedLink>
        )}
      </div>

      {/* 4 · CTAs terciarios: bento grid */}
      {(features.length > 0 || tiles.length > 0) && (
        <section className="mt-7 short:mt-5" aria-labelledby="connect-title">
          <h2 id="connect-title" className="mb-2.5 px-1 short:mb-2 text-[10.5px] font-medium tracking-[0.22em] text-zinc-500 uppercase">
            Conecta con nosotros
          </h2>
          {features.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {features.map((feature) => (
                <TrackedLink
                  key={feature.track}
                  href={feature.href}
                  {...link(feature.track)}
                  className="group block rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3 backdrop-blur-md transition-transform duration-150 active:scale-[0.985]"
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${feature.iconClass}`}>{feature.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-zinc-100">{feature.label}</span>
                      <span className="block truncate text-[11px] text-zinc-500">{feature.detail}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-zinc-50 px-3.5 py-1.5 text-[12px] font-semibold text-zinc-950">
                      {feature.cta}
                    </span>
                  </span>
                  <span className={`mt-3 grid gap-1.5 ${PHOTO_COLS[feature.photos.length]}`}>
                    {feature.photos.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        width={360}
                        height={feature.portrait ? 480 : 360}
                        loading="lazy"
                        decoding="async"
                        className={`w-full rounded-lg object-cover ${feature.portrait ? 'aspect-[3/4]' : 'aspect-square'}`}
                      />
                    ))}
                  </span>
                </TrackedLink>
              ))}
            </div>
          )}
          {tiles.length > 0 && (
            <div className={`grid grid-cols-2 gap-2.5 ${features.length > 0 ? 'mt-2.5' : ''}`}>
              {tiles.map((tile, i) => (
                <TrackedLink
                  key={tile.track}
                  href={tile.href}
                  {...link(tile.track)}
                  className={`flex h-[60px] min-w-0 short:h-14 items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 px-3.5 backdrop-blur-md transition-transform duration-150 active:scale-[0.97] ${
                    tiles.length % 2 === 1 && i === tiles.length - 1 ? 'col-span-2' : ''
                  }`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-800/80 text-zinc-100 ring-1 ring-white/[0.06] ring-inset">
                    {tile.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-zinc-100">{tile.label}</span>
                    <span className="block truncate text-[11px] text-zinc-500">{tile.detail}</span>
                  </span>
                </TrackedLink>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5 · Footer B2B */}
      <footer className="mt-auto pt-9 text-center short:pt-6">
        <TrackedLink
          href={brandUrl(brand.url, profile.slug)}
          {...link('brand')}
          className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <Nfc className="size-3.5" strokeWidth={1.8} />
          Soporte artesanal NFC por <span className="font-medium text-zinc-400">{brand.name}</span>
        </TrackedLink>
      </footer>
    </main>
  )
}
