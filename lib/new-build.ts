import { euroLabel } from './crm'

export const UNIT_STATUSES = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida' } as const

export type UnitStatus = keyof typeof UNIT_STATUSES

// Los colores de la casilla de cada estado en el edificio.
export const UNIT_CELLS: Record<UnitStatus, string> = {
  available: 'bg-teal-600 text-white hover:bg-teal-700',
  reserved: 'bg-amber-300 text-amber-950 hover:bg-amber-400',
  sold: 'bg-slate-200 text-slate-400',
}

type UnitLike = { floor: number; letter: string; status: string; price: number; outdoorArea: number }

export function unitStatus(unit: { status: string }): UnitStatus {
  return unit.status in UNIT_STATUSES ? (unit.status as UnitStatus) : 'available'
}

/** «Bajo», «3.º» o «Ático», sabiendo cuántas plantas tiene el edificio. */
export function floorLabel(floor: number, floors: number): string {
  if (floor === 0) return 'Bajo'

  return floor === floors ? 'Ático' : `${floor}.º`
}

/** «3.º B». */
export function unitName(unit: { floor: number; letter: string }, floors: number): string {
  return `${floorLabel(unit.floor, floors)} ${unit.letter}`
}

/** Las viviendas agrupadas por planta, de la más alta a la baja, como se ve el edificio. */
export function floorsFromTop<T extends UnitLike>(units: T[]): [number, T[]][] {
  const sorted = units.toSorted((a, b) => b.floor - a.floor || a.letter.localeCompare(b.letter))

  return [...Map.groupBy(sorted, (unit) => unit.floor)]
}

/** El precio de la vivienda disponible más barata, o null si ya no queda ninguna. */
export function priceFrom(units: UnitLike[]): number | null {
  const prices = units.filter((unit) => unit.status === 'available').map((unit) => unit.price)

  return prices.length ? Math.min(...prices) : null
}

/** Terraza en las plantas altas y jardín en la baja. */
export function outdoorLabel(unit: UnitLike): string | null {
  if (unit.outdoorArea === 0) return null

  return `${unit.floor === 0 ? 'Jardín' : 'Terraza'} de ${unit.outdoorArea} m²`
}

/** «2 dormitorios · 1 baño · 70 m² útiles · Terraza de 7 m²». */
export function unitSummary(unit: UnitLike & { bedrooms: number; bathrooms: number; area: number }): string {
  return [
    `${unit.bedrooms} ${unit.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}`,
    `${unit.bathrooms} ${unit.bathrooms === 1 ? 'baño' : 'baños'}`,
    `${unit.area} m² útiles`,
    outdoorLabel(unit),
  ].filter(Boolean).join(' · ')
}

export function priceFromLabel(units: UnitLike[]): string {
  const from = priceFrom(units)

  return from ? `Desde ${euroLabel(from)}` : 'Todo vendido'
}

/** Las imágenes de la promoción, que Prisma devuelve como JSON. */
export function developmentImages(development: { images: unknown }): string[] {
  return Array.isArray(development.images) ? development.images.map(String) : []
}
