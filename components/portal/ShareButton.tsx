'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/** Comparte el portal con el menú nativo del móvil; en escritorio copia el enlace. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // El usuario cerró el menú de compartir: no hay nada que hacer.
    }
  }

  return (
    <button type="button" onClick={share} aria-label={copied ? 'Enlace copiado' : 'Compartir'} className={className}>
      {copied ? <Check className="size-[18px]" strokeWidth={2} /> : <Share2 className="size-[18px]" strokeWidth={1.8} />}
    </button>
  )
}
