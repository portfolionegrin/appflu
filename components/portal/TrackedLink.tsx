'use client'

import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import type { TrackTarget } from '@/lib/types'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  profileId: string
  track: TrackTarget
  /** En /preview no se registra nada. */
  trackingDisabled?: boolean
}

function sendClick(profileId: string, target: TrackTarget) {
  const body = JSON.stringify({ p: profileId, t: target })
  try {
    // sendBeacon sobrevive a la navegación y no bloquea el hilo: el enlace abre
    // Google, Booksy o Instagram en el mismo instante en que se pulsa.
    if (navigator.sendBeacon?.('/api/track', body)) return
  } catch {
    // Algunos navegadores in-app lanzan en vez de devolver false.
  }
  fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
}

/**
 * Enlace nativo (<a href>) con tracking en segundo plano. Nunca hace
 * preventDefault: la navegación y la apertura de la app nativa no esperan a nada.
 */
export function TrackedLink({ profileId, track, trackingDisabled, onClick, ...props }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!trackingDisabled) sendClick(profileId, track)
    onClick?.(event)
  }

  return <a {...props} onClick={handleClick} />
}
