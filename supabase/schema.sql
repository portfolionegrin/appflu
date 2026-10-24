-- =====================================================================
--  Portales NFC multi-tenant · Esquema Supabase
--  Pega este archivo completo en Supabase → SQL Editor → Run.
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  1. PROFILES · un registro por negocio (tenant)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null,
  business_name     text not null,
  subtitle          text,
  logo_url          text,
  theme_accent      text,
  mode              text not null default 'portal',
  direct_url        text,
  google_review_url text,
  booking_url       text,
  booking_label     text default 'Reservar próxima cita',
  website_url       text,
  website_label     text,
  website_photos    text[],
  website_logo_url  text,
  instagram_url     text,
  tiktok_url        text,
  whatsapp_phone    text,
  instagram_photos  text[],
  booking_photos    text[],
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint profiles_slug_key        unique (slug),
  constraint profiles_slug_format     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64),
  constraint profiles_mode_check      check (mode in ('portal', 'direct')),
  constraint profiles_accent_format   check (theme_accent is null or theme_accent ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$'),
  constraint profiles_direct_has_url  check (mode <> 'direct' or coalesce(direct_url, google_review_url) is not null)
);

-- Si creaste la tabla con una versión anterior de este script:
alter table public.profiles add column if not exists instagram_photos text[];
alter table public.profiles add column if not exists booking_photos   text[];
alter table public.profiles add column if not exists website_label    text;
alter table public.profiles add column if not exists website_photos   text[];
alter table public.profiles add column if not exists website_logo_url text;

comment on column public.profiles.mode is
  '''portal'' muestra la interfaz; ''direct'' hace un 307 a direct_url (o a google_review_url si está vacío).';
comment on column public.profiles.whatsapp_phone is
  'Con prefijo internacional, solo dígitos o con +/espacios. Ej: +34 600 000 000';
comment on column public.profiles.instagram_photos is
  'Hasta 3 URLs de fotos para la tarjeta de Instagram (https://... o /clients/<slug>/...).';
comment on column public.profiles.website_photos is
  'Hasta 3 URLs de fotos para la tarjeta de la web (p. ej. prendas de una tienda).';
comment on column public.profiles.website_logo_url is
  'Logo cuadrado de la web o tienda; sustituye al icono genérico.';
comment on column public.profiles.booking_photos is
  'Hasta 3 URLs de fotos para la tarjeta de reserva.';

-- La restricción UNIQUE ya crea un índice B-tree sobre slug. Este índice
-- parcial cubre exactamente la consulta del portal (slug + is_active).
create index if not exists profiles_active_slug_idx
  on public.profiles (slug) where is_active;

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
--  2. ANALYTICS_EVENTS · escaneos y clics (RGPD-friendly)
--     · Sin IP, sin cookies, sin identificadores de usuario.
--     · user_agent guarda solo un resumen ("iOS · Safari"), nunca la
--       cadena completa, para que no sirva como huella digital.
-- ---------------------------------------------------------------------
create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  event_type  text not null,
  target      text,
  user_agent  text,
  device_type text,
  created_at  timestamptz not null default now(),

  constraint analytics_event_type_check check (event_type in ('scan', 'click')),
  constraint analytics_target_check check (
    target is null or target in (
      'google_review', 'booksy', 'website', 'instagram', 'tiktok', 'whatsapp', 'brand'
    )
  ),
  -- Un clic siempre lleva target; un escaneo nunca.
  constraint analytics_target_matches_type check ((event_type = 'click') = (target is not null)),
  constraint analytics_device_check check (
    device_type is null or device_type in ('mobile', 'tablet', 'desktop', 'unknown')
  ),
  constraint analytics_ua_length check (user_agent is null or char_length(user_agent) <= 64)
);

create index if not exists analytics_profile_created_idx
  on public.analytics_events (profile_id, created_at desc);
create index if not exists analytics_profile_type_target_idx
  on public.analytics_events (profile_id, event_type, target);

-- ---------------------------------------------------------------------
--  3. ROW LEVEL SECURITY
--     La app usa la clave anon SOLO en el servidor (nunca llega al
--     navegador). Aun así, RLS limita lo que esa clave puede hacer:
--       · profiles:          leer únicamente negocios activos.
--       · analytics_events:  insertar, nunca leer/editar/borrar.
--     Tus dashboards leen con la service_role key o desde el panel.
-- ---------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "Portales activos son públicos" on public.profiles;
create policy "Portales activos son públicos"
  on public.profiles
  for select
  to anon, authenticated
  using (is_active);

drop policy if exists "Registrar eventos de portales activos" on public.analytics_events;
create policy "Registrar eventos de portales activos"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.is_active
    )
  );

-- La clave anon solo puede rellenar estas columnas: ni id ni created_at.
revoke insert, update, delete on public.analytics_events from anon, authenticated;
grant insert (profile_id, event_type, target, user_agent, device_type)
  on public.analytics_events to anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;

-- ---------------------------------------------------------------------
--  4. VISTA DE RESUMEN (solo service_role / panel de Supabase)
--     Días en hora canaria; cambia la zona horaria si lo necesitas.
-- ---------------------------------------------------------------------
create or replace view public.analytics_daily
with (security_invoker = true) as
select
  p.slug,
  (e.created_at at time zone 'Atlantic/Canary')::date                 as day,
  count(*) filter (where e.event_type = 'scan')                         as scans,
  count(*) filter (where e.target = 'google_review')                    as google_review_clicks,
  count(*) filter (where e.target = 'booksy')                           as booking_clicks,
  count(*) filter (where e.event_type = 'click'
                     and e.target not in ('google_review', 'booksy'))   as other_clicks
from public.analytics_events e
join public.profiles p on p.id = e.profile_id
group by 1, 2;

revoke all on public.analytics_daily from anon, authenticated;

-- =====================================================================
--  5. SEED DATA
--     Los mismos datos están en lib/demo-profiles.ts para que la app se
--     vea funcionando en local sin Supabase. Mantenlos sincronizados.
-- =====================================================================

-- Negocio ficticio de demostración
insert into public.profiles (
  id, slug, business_name, subtitle, logo_url, theme_accent, mode, direct_url,
  google_review_url, booking_url, booking_label, website_url, website_label, website_photos, website_logo_url,
  instagram_url, tiktok_url, whatsapp_phone, instagram_photos, booking_photos, is_active
) values (
  '8b1f6a52-3c4e-4f0a-9d7b-2a6c5e1f0a01',
  'atelier-corte-barba',
  'Atelier Corte & Barba',
  'Barbería de autor · Desde 2016',
  null,
  '#D4AF37',
  'portal',
  null,
  'https://search.google.com/local/writereview?placeid=ChIJ_ATELIER_DEMO_PLACE_ID',
  'https://booksy.com/es-es/000000_atelier-corte-barba_barberia_00000_madrid',
  'Reservar próxima cita en Booksy',
  'https://ateliercortebarba.example',
  null,
  null,
  null,
  'https://www.instagram.com/ateliercortebarba.demo/',
  'https://www.tiktok.com/@ateliercortebarba.demo',
  '+34 600 000 000',
  null,
  null,
  true
)
on conflict (slug) do update set
  business_name     = excluded.business_name,
  subtitle          = excluded.subtitle,
  logo_url          = excluded.logo_url,
  theme_accent      = excluded.theme_accent,
  mode              = excluded.mode,
  direct_url        = excluded.direct_url,
  google_review_url = excluded.google_review_url,
  booking_url       = excluded.booking_url,
  booking_label     = excluded.booking_label,
  website_url       = excluded.website_url,
  website_label     = excluded.website_label,
  website_photos    = excluded.website_photos,
  website_logo_url  = excluded.website_logo_url,
  instagram_url     = excluded.instagram_url,
  tiktok_url        = excluded.tiktok_url,
  whatsapp_phone    = excluded.whatsapp_phone,
  instagram_photos  = excluded.instagram_photos,
  booking_photos    = excluded.booking_photos,
  is_active         = excluded.is_active;

-- Cliente real: NOVA Studio (Vecindario, Gran Canaria)
insert into public.profiles (
  id, slug, business_name, subtitle, logo_url, theme_accent, mode, direct_url,
  google_review_url, booking_url, booking_label, website_url, website_label, website_photos, website_logo_url,
  instagram_url, tiktok_url, whatsapp_phone, instagram_photos, booking_photos, is_active
) values (
  '3d2c9e7a-51b8-4c6f-8e0d-7f4a1b2c3d02',
  'nova-studio',
  'NOVA Studio',
  'Vecindario · Gran Canaria',
  '/logos/nova-studio.png',
  '#C5A059',
  'portal',
  null,
  'https://search.google.com/local/writereview?placeid=ChIJHVeDXOOfQAwRMTEKo4xrOvM',
  'https://novastudiogc.booksy.com',
  'Reservar próxima cita en Booksy',
  'https://novasupply.es',
  'Tienda de ropa',
  array['/clients/nova-studio/shop-1.jpg', '/clients/nova-studio/shop-2.jpg', '/clients/nova-studio/shop-3.jpg'],
  '/clients/nova-studio/supply-logo.png',
  'https://www.instagram.com/novastudio.gc/',
  null,
  null,
  array['/clients/nova-studio/ig-1.jpg', '/clients/nova-studio/ig-2.jpg', '/clients/nova-studio/ig-3.jpg'],
  array['/clients/nova-studio/booking-1.jpg', '/clients/nova-studio/booking-2.jpg', '/clients/nova-studio/booking-3.jpg'],
  true
)
on conflict (slug) do update set
  business_name     = excluded.business_name,
  subtitle          = excluded.subtitle,
  logo_url          = excluded.logo_url,
  theme_accent      = excluded.theme_accent,
  mode              = excluded.mode,
  direct_url        = excluded.direct_url,
  google_review_url = excluded.google_review_url,
  booking_url       = excluded.booking_url,
  booking_label     = excluded.booking_label,
  website_url       = excluded.website_url,
  website_label     = excluded.website_label,
  website_photos    = excluded.website_photos,
  website_logo_url  = excluded.website_logo_url,
  instagram_url     = excluded.instagram_url,
  tiktok_url        = excluded.tiktok_url,
  whatsapp_phone    = excluded.whatsapp_phone,
  instagram_photos  = excluded.instagram_photos,
  booking_photos    = excluded.booking_photos,
  is_active         = excluded.is_active;
