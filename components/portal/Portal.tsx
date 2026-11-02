import type { CSSProperties, ReactNode } from 'react'
import { ArrowUpRight, CalendarDays, Globe, MapPin, Nfc, ShoppingBag } from 'lucide-react'
import type { Profile, TrackTarget } from '@/lib/types'
import {
  brandUrl,
  hostFromUrl,
  mapsUrl,
  photoList,
  safeAccent,
  safeImage,
  safePageColor,
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

/** Botón de la lista: miniatura cuadrada a la izquierda y título centrado.
 *  Las redes (Instagram, TikTok…) no van aquí: ya están en la fila de iconos. */
type LinkButton = { track: TrackTarget; href: string; title: string; thumb: ReactNode }

type Social = { track: TrackTarget; href: string; label: string; icon: ReactNode }

/* ------------------------------------------------------------------ */
/*  Miniaturas: logo de marca > primera foto > icono                   */
/* ------------------------------------------------------------------ */

function Photo({ src, white }: { src: string; white?: boolean }) {
  // <img> y no next/image: imágenes ya optimizadas, sin pasar por el optimizador
  return <img src={src} alt="" width={96} height={96} decoding="async" className={`size-full object-cover ${white ? 'bg-white' : ''}`} />
}

function IconThumb({ children, className = 'bg-white/15 text-white' }: { children: ReactNode; className?: string }) {
  return <span className={`grid size-full place-items-center ${className}`}>{children}</span>
}

function buildButtons(profile: Profile): LinkButton[] {
  const buttons: LinkButton[] = []
  const review = safeUrl(profile.google_review_url)
  const booking = safeUrl(profile.booking_url)
  const website = safeUrl(profile.website_url)

  if (review) {
    buttons.push({
      track: 'google_review',
      href: review,
      title: 'Valóranos en Google',
      thumb: (
        <IconThumb className="bg-white">
          <GoogleIcon className="size-[26px]" />
        </IconThumb>
      ),
    })
  }
  if (booking) {
    const photo = photoList(profile.booking_photos)[0]
    buttons.push({
      track: 'booksy',
      href: booking,
      title: profile.booking_label || 'Reserva tu cita',
      thumb: hostFromUrl(booking).endsWith('booksy.com') ? (
        <Photo src="/brands/booksy.png" />
      ) : photo ? (
        <Photo src={photo} />
      ) : (
        <IconThumb>
          <CalendarDays className="size-6" strokeWidth={1.8} />
        </IconThumb>
      ),
    })
  }
  if (website) {
    const logo = safeImage(profile.website_logo_url)
    const photo = photoList(profile.website_photos)[0]
    const Icon = /tienda|shop|store/i.test(profile.website_label ?? '') ? ShoppingBag : Globe
    buttons.push({
      track: 'website',
      href: website,
      title: profile.website_label || 'Página web',
      thumb: logo ? (
        <Photo src={logo} white />
      ) : photo ? (
        <Photo src={photo} />
      ) : (
        <IconThumb>
          <Icon className="size-6" strokeWidth={1.8} />
        </IconThumb>
      ),
    })
  }
  return buttons
}

function socialLinks(profile: Profile): Social[] {
  const socials: Social[] = []
  const instagram = safeUrl(profile.instagram_url)
  const tiktok = safeUrl(profile.tiktok_url)
  const whatsapp = whatsappUrl(profile.whatsapp_phone)
  const maps = mapsUrl(safeUrl(profile.google_review_url), profile.business_name)
  if (instagram) socials.push({ track: 'instagram', href: instagram, label: 'Instagram', icon: <InstagramIcon className="size-[26px]" strokeWidth={2} /> })
  if (tiktok) socials.push({ track: 'tiktok', href: tiktok, label: 'TikTok', icon: <TikTokIcon className="size-6" /> })
  if (whatsapp) socials.push({ track: 'whatsapp', href: whatsapp, label: 'WhatsApp', icon: <WhatsAppIcon className="size-6" /> })
  if (maps) socials.push({ track: 'maps', href: maps, label: 'Cómo llegar', icon: <MapPin className="size-[26px]" strokeWidth={2} /> })
  return socials
}

/* ------------------------------------------------------------------ */
/*  Portal                                                             */
/* ------------------------------------------------------------------ */

const CORNER =
  'grid size-11 cursor-pointer place-items-center rounded-[14px] bg-white text-zinc-900 shadow-[0_2px_12px_rgb(0_0_0/0.15)] transition duration-200 hover:scale-105 active:scale-95'

export function Portal({ profile, brand, trackingDisabled }: Props) {
  const link = (track: TrackTarget) => ({ profileId: profile.id, track, trackingDisabled })
  const page = safePageColor(profile.page_color)
  const hero = safeImage(profile.hero_url)
  const wordmark = safeImage(profile.wordmark_url)
  const logo = safeImage(profile.logo_url)
  const buttons = buildButtons(profile)
  const socials = socialLinks(profile)

  return (
    <>
      {/* El color del portal también en el rebote de iOS y en la barra del navegador */}
      <style>{`html{background:${page}}body{background:transparent}`}</style>
      {/* Fuera del <main>: en pantallas grandes el perfil va en una tarjeta, como en Linktree */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-page sm:bg-page-deep" style={{ '--page': page } as CSSProperties} />
      <main
        className="relative isolate mx-auto flex min-h-dvh w-full max-w-[480px] flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white sm:my-6 sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[28px] sm:bg-page sm:shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)]"
        style={{ '--accent': safeAccent(profile.theme_accent), '--page': page } as CSSProperties}
      >
        {/* Botones flotantes de las esquinas, como en Linktree */}
        <div
          className={`absolute inset-x-0 top-0 z-20 flex px-4 pt-[max(1rem,env(safe-area-inset-top))] ${
            profile.show_branding ? 'justify-between' : 'justify-end'
          }`}
        >
          {profile.show_branding && (
            <TrackedLink href={brandUrl(brand.url, profile.slug)} {...link('brand')} aria-label={`Soporte NFC por ${brand.name}`} className={CORNER}>
              <Nfc className="size-5" strokeWidth={2} />
            </TrackedLink>
          )}
          <ShareButton title={profile.business_name} className={CORNER} />
        </div>

        {/* 1 · Cabecera: foto a sangre que se funde con el fondo, o avatar clásico */}
        {hero ? (
          <div className="relative">
            <img
              src={hero}
              alt=""
              width={862}
              height={1150}
              fetchPriority="high"
              className="aspect-[4/5] max-h-[64svh] w-full object-cover object-[50%_22%] short:max-h-[56svh]"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-page" />
          </div>
        ) : (
          <div className="flex justify-center pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))]">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-white/10 ring-2 ring-white/20">
              {logo ? (
                <img src={logo} alt="" width={96} height={96} fetchPriority="high" className="size-full object-cover" />
              ) : (
                <span className="text-[2.2rem] font-bold">{profile.business_name.trim().charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        )}

        <header className={`relative z-10 flex flex-col items-center px-5 text-center ${hero ? '-mt-[72px]' : 'mt-4'}`}>
          {wordmark ? (
            <h1>
              <img
                src={wordmark}
                alt={profile.business_name}
                width={556}
                height={193}
                className="h-auto w-[176px] drop-shadow-[0_2px_10px_rgb(0_0_0/0.25)] short:w-[156px]"
              />
            </h1>
          ) : (
            <h1 className="text-[22px] leading-tight font-bold tracking-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.2)]">{profile.business_name}</h1>
          )}
          {profile.subtitle && <p className="mt-2 text-[13px] font-medium text-white/80">{profile.subtitle}</p>}

          {socials.length > 0 && (
            <nav aria-label="Redes y contacto" className="mt-3 flex items-center gap-2">
              {socials.map((social) => (
                <TrackedLink
                  key={social.track}
                  href={social.href}
                  {...link(social.track)}
                  aria-label={social.label}
                  title={social.label}
                  className="grid size-11 place-items-center rounded-full text-white transition duration-200 hover:scale-110 hover:bg-white/10 active:scale-95"
                >
                  {social.icon}
                </TrackedLink>
              ))}
            </nav>
          )}
        </header>

        {/* 2 · Enlaces: borde blanco fino, miniatura a la izquierda, título centrado */}
        <div className="mt-5 flex flex-col gap-3.5 px-4 short:mt-4 short:gap-3">
          {buttons.map((button) => (
            <TrackedLink
              key={button.track}
              href={button.href}
              {...link(button.track)}
              className="group relative flex min-h-16 items-center justify-center rounded-[12px] border-[1.5px] border-white/90 px-[68px] py-2.5 text-center transition duration-200 hover:bg-white/10 active:scale-[0.98]"
            >
              <span className="absolute top-1/2 left-2 size-12 -translate-y-1/2 overflow-hidden rounded-[8px]">{button.thumb}</span>
              <span className="text-[15.5px] leading-snug font-semibold text-balance [text-shadow:0_1px_2px_rgb(0_0_0/0.18)]">
                {button.title}
              </span>
              <ArrowUpRight
                aria-hidden
                className="absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-[calc(50%+2px)]"
              />
            </TrackedLink>
          ))}
        </div>

        {/* 3 · Pie B2B (se puede desactivar por negocio con show_branding) */}
        {profile.show_branding && (
          <footer className="mt-auto pt-10 text-center">
            <TrackedLink
              href={brandUrl(brand.url, profile.slug)}
              {...link('brand')}
              className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-white/65 transition-colors hover:text-white"
            >
              <Nfc className="size-3.5" strokeWidth={1.8} />
              Soporte artesanal NFC por <span className="font-semibold text-white/90">{brand.name}</span>
            </TrackedLink>
          </footer>
        )}
      </main>
    </>
  )
}
