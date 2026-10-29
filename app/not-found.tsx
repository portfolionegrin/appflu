import { Nfc } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export default function NotFound() {
  return (
    <main className="portal-backdrop flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Nfc className="size-8 text-accent" strokeWidth={1.6} />
      <h1 className="mt-4 font-display text-3xl font-semibold text-zinc-50">Portal no disponible</h1>
      <p className="mt-2 max-w-xs text-sm text-zinc-400">
        Esta placa no está activa o el enlace no es correcto. Pregunta en el local o vuelve a acercar el móvil.
      </p>
      <a href={BRAND.url} className="mt-8 text-[11px] tracking-wide text-zinc-600">
        Soporte artesanal NFC por <span className="font-medium text-zinc-400">{BRAND.name}</span>
      </a>
    </main>
  )
}
