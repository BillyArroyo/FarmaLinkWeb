import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Primera letra mayúscula, el resto minúscula. "ALKHOFAR" → "Alkhofar" */
export function capitalizar(str: string | null | undefined): string {
  if (!str) return ''
  const s = str.trim()
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function fmt(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}
