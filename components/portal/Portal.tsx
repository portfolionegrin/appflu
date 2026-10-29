import type { CSSProperties, ReactNode } from 'react'
import { ArrowUpRight, BadgeCheck, CalendarDays, Globe, MapPin, Nfc, ShoppingBag, Star } from 'lucide-react'
import type { Profile, TrackTarget } from '@/lib/types'
import {
  brandUrl,
  handleFromUrl,
  hostFromUrl,
  mapsUrl,
  photoList,
  safeAccent,
  safeImage,
  safeUrl,
  whatsappUrl,
} from '@/lib/links'
import { GoogleIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './BrandIcons'
import { ShareButton } from './ShareButton'
import { TrackedLink } from './TrackedLink'

export type Brand = { name: string; url: string }

type Props = {
  profile: Profile
  brand: Brand
  /** En /preview los clics no se registran. */
  trackingDisabled?: boolean
}

/** Un enlace del portal, se pinte como botón principal o como tarjeta. */
type Item = {
  track: TrackTarget
  href: string
  title: string
  subtitle: ReactNode
  icon: ReactNode
  /** Clases propias del cuadro del icono (logos de marca). Sin ellas, el del contenedor. */
  tile?: string
  /** Distintivo pequeño en la esquina del icono (la G de Google). */
  badge?: ReactNode
  photos: string[]
  /** Fotos verticales (Instagram) o cuadradas (productos). */
  portrait?: boolean
}

type Social = { track: TrackTarget; href: string; label: string; icon: ReactNode }

/* ------------------------------------------------------------------ */
/*  Datos → enlaces                                                    */
/* ------------------------------------------------------------------ */

function MiniStars() {
  return (
    <span className="inline-flex gap-px text-accent" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="star size-3" fill="currentColor" strokeWidth={0} style={{ animationDelay: `${300 + i * 80}ms` }} />
      ))}
    </span>
  )
}

function bookingItem(profile: Profile): Item | null {
  const href = safeUrl(profile.booking_url)
  if (!href) return null
  const booksy = hostFromUrl(href).endsWith('booksy.com')
  return {
    track: 'booksy',
    href,
    title: profile.booking_label || 'Reservar cita',
    subtitle: booksy ? 'Booksy · Elige día y hora' : 'Elige día y hora',
    icon: booksy ? (
      <img src="/brands/booksy.png" alt="" width={44} height={44} className="size-full" />
    ) : (
      <CalendarDays className="size-5" strokeWidth={1.8} />
    ),
    tile: booksy ? 'overflow-hidden' : undefined,
    photos: photoList(profile.booking_photos),
  }
}

function reviewItem(profile: Profile): Item | null {
  const href = safeUrl(profile.google_review_url)
  if (!href) return null
  return {
    track: 'google_review',
    href,
    title: 'Reseñas de Google',
    subtitle: (
      <span className="inline-flex items-center gap-1.5">
        <MiniStars /> Valóranos en 10 s
      </span>
    ),
    icon: <Star className="size-5" fill="currentColor" strokeWidth={0} />,
    tile: 'bg-accent/12 text-accent ring-1 ring-inset ring-accent/25',
    badge: <GoogleIcon className="size-2.5" />,
    photos: [],
  }
}

function websiteItem(profile: Profile): Item | null {
  const href = safeUrl(profile.website_url)
  if (!href) return null
  const logo = safeImage(profile.website_logo_url)
  const Icon = /tienda|shop|store/i.test(profile.website_label ?? '') ? ShoppingBag : Globe
  return {
    track: 'website',
    href,
    title: profile.website_label || 'Página web',
    subtitle: hostFromUrl(href),
    icon: logo ? (
      <img src={logo} alt="" width={44} height={44} className="size-full object-cover" />
    ) : (
      <Icon className="size-5" strokeWidth={1.8} />
    ),
    tile: logo ? 'overflow-hidden bg-white' : undefined,
    photos: photoList(profile.website_photos),
  }
}

function instagramItem(profile: Profile): Item | null {
  const href = safeUrl(profile.instagram_url)
  if (!href) return null
  return {
    track: 'instagram',
    href,
    title: handleFromUrl(href) ?? 'Instagram',
    subtitle: 'Instagram · Nuestros trabajos',
    icon: <InstagramIcon className="size-5" strokeWidth={2} />,
    tile: 'ig-gradient text-white',
    photos: photoList(profile.instagram_photos),
    portrait: true,
  }
}

function tiktokItem(profile: Profile): Item | null {
  const href = safeUrl(profile.tiktok_url)
  if (!href) return null
  return {
    track: 'tiktok',
    href,
    title: handleFromUrl(href) ?? 'TikTok',
    subtitle: 'TikTok',
    icon: <TikTokIcon className="size-[18px]" />,
    tile: 'bg-zinc-950 text-white ring-1 ring-inset ring-white/10',
    photos: [],
  }
}

function socialLinks(profile: Profile): Social[] {
  const socials: Social[] = []
  const instagram = safeUrl(profile.instagram_url)
  const tiktok = safeUrl(profile.tiktok_url)
  const whatsapp = whatsappUrl(profile.whatsapp_phone)
  const maps = mapsUrl(safeUrl(profile.google_review_url), profile.business_name)
  if (instagram) socials.push({ track: 'instagram', href: instagram, label: 'Instagram', icon: <InstagramIcon className="size-[18px]" /> })
  if (tiktok) socials.push({ track: 'tiktok', href: tiktok, label: 'TikTok', icon: <TikTokIcon className="size-4" /> })
  if (whatsapp) socials.push({ track: 'whatsapp', href: whatsapp, label: 'WhatsApp', icon: <WhatsAppIcon className="size-[17px]" /> })
  if (maps) socials.push({ track: 'maps', href: maps, label: 'Cómo llegar', icon: <MapPin className="size-[18px]" strokeWidth={1.8} /> })
  return socials
}

/* ------------------------------------------------------------------ */
/*  Piezas                                                             */
/* ------------------------------------------------------------------ */

const rise = (i: number): CSSProperties => ({ animationDelay: `${80 + i * 70}ms` })

const GLASS =
  'border border-white/10 bg-white/[0.04] backdrop-blur-md transition duration-300 ease-out hover:border-white/20 hover:bg-white/[0.07]'

function IconTile({ item, solid }: { item: Item; solid?: boolean }) {
  const fallback = solid ? 'bg-zinc-950 text-zinc-50' : 'bg-white/[0.06] text-zinc-100 ring-1 ring-inset ring-white/10'
  return (
    <span className={`relative grid size-11 shrink-0 place-items-center rounded-xl ${item.tile ?? fallback}`}>
      {item.icon}
      {item.badge && (
        <span
          className={`absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full bg-white ring-2 ${
            solid ? 'ring-zinc-50' : 'ring-charcoal'
          }`}
        >
          {item.badge}
        </span>
      )}
    </span>
  )
}

/** Miniaturas superpuestas (tipo avatares) para el botón principal. */
function PhotoStack({ photos }: { photos: string[] }) {
  return (
    <span className="flex shrink-0 -space-x-2.5" aria-hidden>
      {photos.map((src) => (
        <img key={src} src={src} alt="" width={64} height={64} decoding="async" className="size-8 rounded-full object-cover ring-2 ring-zinc-50" />
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Portal                                                             */
/* ------------------------------------------------------------------ */

export function Portal({ profile, brand, trackingDisabled }: Props) {
  const link = (track: TrackTarget) => ({ profileId: profile.id, track, trackingDisabled })
  const wordmark = safeImage(profile.wordmark_url)

  // Botón estrella: el que elija el negocio; si falta ese enlace, el otro.
  const booking = bookingItem(profile)
  const review = reviewItem(profile)
  const reviewFirst = profile.primary_action === 'review' ? review !== null : booking === null
  const primary = reviewFirst ? review : booking
  const cards = [websiteItem(profile), reviewFirst ? booking : review, instagramItem(profile), tiktokItem(profile)].filter(
    (item): item is Item => item !== null,
  )
  const socials = socialLinks(profile)

  return (
    <main
      className="relative isolate mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pt-[max(2.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] short:pt-[max(1.5rem,env(safe-area-inset-top))]"
      style={{ '--accent': safeAccent(profile.theme_accent) } as CSSProperties}
    >
      <div aria-hidden className="portal-backdrop pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 -z-10" />

      {/* 1 · Cabecera */}
      <header className="flex flex-col items-center text-center">
        {wordmark ? (
          <h1>
            <img
              src={wordmark}
              alt={profile.business_name}
              width={556}
              height={193}
              fetchPriority="high"
              className="wordmark-glow h-auto w-[216px] short:w-[184px]"
            />
          </h1>
        ) : (
          <>
            <div className="relative size-[88px] short:size-[72px]">
              <div className="logo-ring logo-spin absolute -inset-[1.5px] rounded-full opacity-80" />
              <div className="relative grid size-full place-items-center overflow-hidden rounded-full bg-zinc-950">
                {profile.logo_url ? (
                  // <img> y no next/image: logos de cualquier dominio, sin pasar por el optimizador
                  <img
                    src={profile.logo_url}
                    alt={`Logo de ${profile.business_name}`}
                    width={88}
                    height={88}
                    fetchPriority="high"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-[2rem] font-bold text-accent">{profile.business_name.trim().charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-[26px] leading-tight font-bold tracking-tight text-balance text-zinc-50">{profile.business_name}</h1>
          </>
        )}

        {profile.bio && (
          <p className="mt-4 max-w-[32ch] text-[14.5px] leading-relaxed text-balance text-zinc-400 short:mt-3">{profile.bio}</p>
        )}

        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] font-medium text-zinc-500">
          {profile.subtitle && <span>{profile.subtitle}</span>}
          {profile.subtitle && <span aria-hidden className="size-0.5 rounded-full bg-zinc-600" />}
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <BadgeCheck className="size-3.5 text-accent" strokeWidth={2} />
            Verificado
          </span>
        </p>
      </header>

      {/* 2 · Enlace estrella: sólido, máximo contraste */}
      {primary && (
        <TrackedLink
          href={primary.href}
          {...link(primary.track)}
          style={rise(0)}
          className="rise group mt-8 flex items-center gap-3.5 rounded-[22px] bg-zinc-50 p-3 pr-4 text-zinc-950 shadow-[0_14px_44px_-16px_rgb(255_255_255/0.5)] transition duration-300 ease-out hover:shadow-[0_18px_56px_-14px_rgb(255_255_255/0.65)] motion-safe:hover:scale-[1.02] active:scale-[0.98] short:mt-6"
        >
          <IconTile item={primary} solid />
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-tight font-bold tracking-tight">{primary.title}</span>
            <span className="mt-1 block text-[12.5px] text-zinc-500">{primary.subtitle}</span>
          </span>
          {primary.photos.length > 0 ? (
            <PhotoStack photos={primary.photos} />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-zinc-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-4" strokeWidth={2.2} />
            </span>
          )}
        </TrackedLink>
      )}

      {/* 3 · Enlaces secundarios: tarjetas de cristal */}
      {cards.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-3">
          {cards.map((item, i) => (
            <TrackedLink
              key={item.track}
              href={item.href}
              {...link(item.track)}
              style={rise(i + 1)}
              className={`rise group relative block overflow-hidden rounded-[20px] p-3 ${GLASS} motion-safe:hover:scale-[1.02] active:scale-[0.98]`}
            >
              {/* Filo de luz superior del cristal */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="flex items-center gap-3.5">
                <IconTile item={item} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-tight font-semibold tracking-tight text-zinc-50">{item.title}</span>
                  <span className="mt-1 block truncate text-[12.5px] text-zinc-400">{item.subtitle}</span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-zinc-400 transition duration-300 group-hover:bg-zinc-50 group-hover:text-zinc-950">
                  <ArrowUpRight className="size-4" strokeWidth={2} />
                </span>
              </span>
              {item.photos.length > 0 && (
                <span className="mt-3 grid grid-cols-3 gap-2">
                  {item.photos.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      width={360}
                      height={item.portrait ? 450 : 360}
                      loading="lazy"
                      decoding="async"
                      className={`w-full rounded-xl object-cover transition duration-500 group-hover:brightness-110 ${
                        item.portrait ? 'aspect-[4/5] object-top' : 'aspect-square'
                      }`}
                    />
                  ))}
                </span>
              )}
            </TrackedLink>
          ))}
        </div>
      )}

      {/* 4 · Fila de iconos sociales */}
      <nav aria-label="Redes y contacto" style={rise(cards.length + 1)} className="rise mt-8 flex items-center justify-center gap-3">
        {socials.map((social) => (
          <TrackedLink
            key={social.track}
            href={social.href}
            {...link(social.track)}
            aria-label={social.label}
            title={social.label}
            className={`grid size-11 place-items-center rounded-full text-zinc-400 ${GLASS} hover:text-zinc-50 motion-safe:hover:scale-110 active:scale-95`}
          >
            {social.icon}
          </TrackedLink>
        ))}
        <ShareButton
          title={profile.business_name}
          className={`grid size-11 cursor-pointer place-items-center rounded-full text-zinc-400 ${GLASS} hover:text-zinc-50 motion-safe:hover:scale-110 active:scale-95`}
        />
      </nav>

      {/* 5 · Pie B2B */}
      <footer className="mt-auto pt-10 text-center short:pt-7">
        <TrackedLink
          href={brandUrl(brand.url, profile.slug)}
          {...link('brand')}
          className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <Nfc className="size-3.5" strokeWidth={1.8} />
          Soporte artesanal NFC por <span className="font-semibold text-zinc-400">{brand.name}</span>
        </TrackedLink>
      </footer>
    </main>
  )
}
