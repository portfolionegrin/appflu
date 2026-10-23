# Appflu · Portales NFC

Plataforma multi-tenant que se abre al acercar el móvil a un soporte de madera de
olivo y resina con chip NFC. Cada negocio tiene su portal en `appflu.es/p/<slug>`.

- **Next.js 16 (App Router) + Tailwind CSS 4 + Supabase + lucide-react**
- Modo `portal`: interfaz "Obsidian & Olive" con jerarquía de conversión
  (Reseña Google → Reserva Booksy → Web/RRSS → pie B2B).
- Modo `direct`: redirect **307** desde el servidor a Google Reviews, sin interfaz.
- Analítica de escaneos y clics sin IP ni cookies (RGPD), registrada **después**
  de enviar la respuesta: ni el redirect ni los botones esperan a la base de datos.

La web estática de siempre (`index.html`, `nutricion.html`, `catalogo.html`) sigue
en `public/` y se sirve igual en `appflu.es/`.

---

## Estructura

```
app/
├── layout.tsx              Fuentes, viewport móvil, color de tema
├── globals.css             Tailwind 4 + tokens "Obsidian & Olive" + animaciones
├── not-found.tsx           Placa inactiva o slug inexistente
├── p/[slug]/page.tsx       Portal: carga el perfil, registra el escaneo, 307 si es "direct"
├── p/[slug]/error.tsx      Error de red con botón de reintento
├── preview/page.tsx        Vista previa con datos de demo (sin Supabase, sin tracking)
└── api/track/route.ts      Recibe clics vía sendBeacon → 204 inmediato → insert en after()
components/portal/
├── Portal.tsx              Interfaz completa (Server Component)
├── TrackedLink.tsx         Enlace cliente con sendBeacon / fetch keepalive
└── BrandIcons.tsx          Google (color), Instagram, TikTok, WhatsApp
lib/
├── profiles.ts             getProfile(): caché 60 s + fallback a demo
├── analytics.ts            logEvent(), filtro de bots, resumen de user-agent
├── supabase.ts             Cliente de servidor
├── demo-profiles.ts        Copia del seed (Atelier Corte & Barba, NOVA Studio)
├── links.ts                Validación de URLs y colores, WhatsApp, UTM
├── brand.ts                Tu marca para el pie
└── types.ts
supabase/schema.sql         Tablas, índices, RLS, vista de resumen y seed
public/                     Web estática de Appflu
```

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SUPABASE_URL` | Para datos reales | Supabase → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Para datos reales | La clave `anon` / publishable. Solo se usa en el servidor |
| `BRAND_NAME` | No (`Appflu`) | Texto del pie: "Soporte artesanal NFC por …" |
| `BRAND_URL` | No (`https://appflu.es`) | Enlace del pie (se le añaden UTM con el slug) |

También se aceptan `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, que
son las que crea la integración oficial de Supabase en Vercel.

**Sin Supabase** la app arranca igual con los dos perfiles de demo, así que el
primer deploy ya se puede ver en `/p/nova-studio` y `/p/atelier-corte-barba`.
Cuando configuras Supabase, la base de datos pasa a ser la única fuente de verdad.

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # opcional: déjalo vacío para usar los datos de demo
npm run dev
```

- http://localhost:3000/preview — vista previa (Atelier Corte & Barba)
- http://localhost:3000/preview?slug=nova-studio — vista previa (NOVA Studio)
- http://localhost:3000/p/nova-studio — portal real

## Supabase

1. Crea el proyecto (región **West EU (Paris)**, la misma que las funciones de
   Vercel en `vercel.json`, para que la consulta no cruce el Atlántico).
2. SQL Editor → pega `supabase/schema.sql` → **Run**. Es idempotente.
3. Copia la URL y la clave anon a las variables de entorno.

Seguridad: RLS activado. La clave anon solo puede **leer negocios activos** e
**insertar eventos** (sin poder elegir `id` ni `created_at`). Nadie puede leer la
analítica salvo tú desde el panel o con la `service_role`.

### Dar de alta un negocio

```sql
insert into profiles (slug, business_name, subtitle, google_review_url, booking_url, booking_label, instagram_url)
values ('barberia-imperial', 'Barbería Imperial', 'Madrid · Desde 1998',
        'https://search.google.com/local/writereview?placeid=XXXX',
        'https://booksy.com/es-es/...', 'Reservar próxima cita en Booksy',
        'https://www.instagram.com/barberiaimperial/');
```

Graba en el chip NFC: `https://appflu.es/p/barberia-imperial`.

Para que la placa abra directamente Google Reviews sin interfaz:

```sql
update profiles set mode = 'direct' where slug = 'barberia-imperial';
```

Los cambios tardan como máximo 60 s en verse (caché del perfil).

> **Enlace de reseñas que convierte más:** `https://search.google.com/local/writereview?placeid=<PLACE_ID>`
> abre directamente la ventana de escribir reseña. Saca el Place ID en
> https://developers.google.com/maps/documentation/places/web-service/place-id

### Ver la analítica

```sql
select * from analytics_daily where slug = 'nova-studio' order by day desc;
```

Los previsualizadores de enlaces (WhatsApp, Telegram, Slack…) y los bots no cuentan
como escaneos.

## Deploy en Vercel con appflu.es

1. https://vercel.com/new → importa `portfolionegrin/appflu`. Framework: Next.js
   (se detecta solo). No hace falta tocar nada más.
2. Settings → Environment Variables → añade las de la tabla de arriba (opcional
   para la primera prueba) → Redeploy.
3. Settings → Domains → añade `appflu.es` y `www.appflu.es`. Vercel te dará los
   registros DNS exactos; normalmente:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | A | @ | `76.76.21.21` |
   | CNAME | www | `cname.vercel-dns.com` |

   Borra en tu proveedor de dominio los 4 registros A antiguos de GitHub Pages
   (`185.199.108-111.153`).
4. En GitHub → Settings → Pages, desactiva Pages para que no compita por el dominio.

Producción se despliega desde `main`: mientras los cambios estén en otra rama,
Vercel los publica como preview en una URL `*.vercel.app`.

## Web estática (public/)

Las páginas de presentación son HTML y CSS planos dentro de `public/`. Se editan a
mano y se publican con cada `git push`, igual que antes. Para añadir una app al
catálogo, copia `public/nutricion.html`, cambia los textos y enlázala desde
`public/index.html`.
