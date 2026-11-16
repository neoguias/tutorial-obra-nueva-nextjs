// La agencia de ejemplo del tutorial. Es inventada, igual que sus datos.
export const AGENCY = 'Atalaya Inmobiliaria'

// Las zonas en las que trabaja la agencia. Inmuebles y demandas eligen de esta lista,
// así una búsqueda en «Ruzafa» nunca deja fuera un piso guardado como «ruzafa».
export const ZONES = ['Benimaclet', 'Campanar', 'El Carmen', 'Malvarrosa', 'Patraix', 'Ruzafa'] as const

// Los valores que se guardan van en inglés, como el código, y los textos en español.
export const OPERATIONS = { sale: 'Venta', rent: 'Alquiler' } as const

export const PROPERTY_TYPES = { flat: 'Piso', house: 'Casa', commercial: 'Local', office: 'Oficina' } as const

export const PROPERTY_STATUSES = { available: 'Disponible', reserved: 'Reservado', closed: 'Vendido o alquilado' } as const

export const VISIT_OUTCOMES = { pending: 'Pendiente', interested: 'Le interesa', discarded: 'Descartado' } as const

export type Operation = keyof typeof OPERATIONS
export type PropertyType = keyof typeof PROPERTY_TYPES
export type PropertyStatus = keyof typeof PROPERTY_STATUSES
export type VisitOutcome = keyof typeof VISIT_OUTCOMES

export function label<T extends Record<string, string>>(labels: T, value: string | null): string {
  return value && value in labels ? labels[value as keyof T] : ''
}

const euros = new Intl.NumberFormat('es-ES', { useGrouping: 'always' })

/** 289.000 € en venta y 850 €/mes en alquiler. */
export function priceLabel(property: { price: number; operation: string }): string {
  const amount = `${euros.format(property.price)} €`

  return property.operation === 'rent' ? `${amount}/mes` : amount
}

export function euroLabel(amount: number): string {
  return `${euros.format(amount)} €`
}

// Las fechas se muestran siempre con la hora de la agencia, esté donde esté el servidor.
const TIME_ZONE = 'Europe/Madrid'

export function dayLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE }).format(date)
}

export function timeLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(date)
}

/** La fecha de la agencia en formato 2026-11-18, para agrupar las visitas por día. */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date)
}
