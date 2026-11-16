import type { Demand, Prisma, Property } from '@/app/generated/prisma/client'

/**
 * Los inmuebles disponibles que encajan con lo que busca una demanda. Si la demanda no fija
 * tipo o zona, vale cualquiera.
 */
export function propertiesMatching(demand: Demand): Prisma.PropertyWhereInput {
  return {
    status: 'available',
    operation: demand.operation,
    price: { lte: demand.maxPrice },
    bedrooms: { gte: demand.minBedrooms },
    area: { gte: demand.minArea },
    ...(demand.type ? { type: demand.type } : {}),
    ...(demand.zone ? { zone: demand.zone } : {}),
  }
}

/**
 * Las demandas activas a las que les sirve un inmueble: el cruce visto desde el otro lado.
 * Una demanda sin tipo o sin zona acepta cualquiera.
 */
export function demandsMatching(property: Property): Prisma.DemandWhereInput {
  // Un inmueble reservado o vendido ya no le sirve a nadie: `in: []` no encaja con ninguna fila.
  if (property.status !== 'available') {
    return { id: { in: [] } }
  }

  return {
    active: true,
    operation: property.operation,
    maxPrice: { gte: property.price },
    minBedrooms: { lte: property.bedrooms },
    minArea: { lte: property.area },
    AND: [
      { OR: [{ type: null }, { type: property.type }] },
      { OR: [{ zone: null }, { zone: property.zone }] },
    ],
  }
}
