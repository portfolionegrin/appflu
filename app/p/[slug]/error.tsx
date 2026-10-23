'use client'

import { RotateCw } from 'lucide-react'

export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="portal-backdrop flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-semibold text-zinc-50">Un momento…</h1>
      <p className="mt-2 max-w-xs text-sm text-zinc-400">No hemos podido cargar el portal. Inténtalo de nuevo.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-zinc-950"
      >
        <RotateCw className="size-4" /> Reintentar
      </button>
    </main>
  )
}
