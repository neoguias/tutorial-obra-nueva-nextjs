import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { priceLabel } from '@/lib/crm'
import { demandsMatching, propertiesMatching } from '@/lib/matching'
import { fieldErrors, photosSchema, propertySchema, visitSchema } from '@/lib/validation'

function property(data: Partial<Parameters<typeof db.property.create>[0]['data']> = {}) {
  return db.property.create({
    data: { reference: 'AT-1', title: 'Piso de prueba', operation: 'sale', type: 'flat', zone: 'Ruzafa', price: 280000, bedrooms: 3, area: 90, ...data },
  })
}

async function demand(data: Record<string, unknown> = {}) {
  const contact = await db.contact.create({ data: { name: 'Lucía' } })

  return db.demand.create({
    data: { contactId: contact.id, operation: 'sale', type: 'flat', zone: 'Ruzafa', maxPrice: 300000, minBedrooms: 2, ...data },
  })
}

beforeEach(async () => {
  await db.visit.deleteMany()
  await db.demand.deleteMany()
  await db.contact.deleteMany()
  await db.property.deleteMany()
})

describe('el cruce', () => {
  it('funciona en los dos sentidos', async () => {
    const flat = await property()
    const wanted = await demand()

    expect(await db.property.count({ where: { id: flat.id, ...propertiesMatching(wanted) } })).toBe(1)
    expect(await db.demand.count({ where: { id: wanted.id, ...demandsMatching(flat) } })).toBe(1)
  })

  it('acepta cualquier tipo y zona si la demanda no los fija', async () => {
    const house = await property({ type: 'house', zone: 'Patraix' })
    await demand({ type: null, zone: null })

    expect(await db.demand.count({ where: demandsMatching(house) })).toBe(1)
  })

  it('deja fuera lo que se pasa de precio, tiene pocos dormitorios, está vendido o es de alquiler', async () => {
    const wanted = await demand()
    await property({ reference: 'AT-2', price: 310000 })
    await property({ reference: 'AT-3', bedrooms: 1 })
    await property({ reference: 'AT-4', status: 'closed' })
    await property({ reference: 'AT-5', operation: 'rent', price: 900 })

    expect(await db.property.count({ where: propertiesMatching(wanted) })).toBe(0)
  })

  it('no encuentra interesados para un inmueble reservado', async () => {
    const reserved = await property({ status: 'reserved' })
    await demand()

    expect(await db.demand.count({ where: demandsMatching(reserved) })).toBe(0)
  })
})

describe('los formularios', () => {
  it('explican en español qué falta en un inmueble', () => {
    const result = propertySchema.safeParse({ reference: 'AT-9', title: '', operation: 'sale', type: 'flat', zone: '', price: '', bedrooms: '2', area: '' })

    expect(result.success).toBe(false)
    const errors = fieldErrors(result.error!)
    expect(errors.title).toEqual(['Rellena el título.'])
    expect(errors.zone).toEqual(['Rellena la zona.'])
    expect(errors.price).toEqual(['Rellena el precio.'])
  })

  it('no dejan programar una visita en el pasado', () => {
    expect(visitSchema.safeParse({ contactId: '1', scheduledAt: '2020-01-10T10:00' }).success).toBe(false)
    expect(visitSchema.safeParse({ contactId: '1', scheduledAt: '2099-01-10T10:00' }).success).toBe(true)
  })
})

describe('las fotos', () => {
  const file = (name: string, type: string, bytes = 10) => new File([new Uint8Array(bytes)], name, { type })

  it('aceptan imágenes JPG, PNG y WebP', () => {
    expect(photosSchema.safeParse([file('salon.jpg', 'image/jpeg'), file('cocina.webp', 'image/webp')]).success).toBe(true)
  })

  it('rechazan otros archivos, las de más de 5 MB y un envío sin fotos', () => {
    const message = (files: File[]) => photosSchema.safeParse(files).error?.issues[0].message

    expect(message([file('contrato.pdf', 'application/pdf')])).toBe('Las fotos tienen que ser JPG, PNG o WebP.')
    expect(message([file('enorme.jpg', 'image/jpeg', 6 * 1024 * 1024)])).toBe('Cada foto puede ocupar como máximo 5 MB.')
    expect(message([file('', 'application/octet-stream', 0)])).toBe('Elige al menos una foto.')
  })
})

it('escribe los precios como en España', () => {
  expect(priceLabel({ price: 289000, operation: 'sale' })).toBe('289.000 €')
  expect(priceLabel({ price: 1250, operation: 'rent' })).toBe('1.250 €/mes')
})
