import type { Brand } from '@/components/portal/Portal'

export const BRAND: Brand = {
  name: process.env.BRAND_NAME || 'Appflu',
  url: process.env.BRAND_URL || 'https://appflu.es',
}
