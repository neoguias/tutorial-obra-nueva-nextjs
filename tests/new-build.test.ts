import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { saveInquiry, setUnitStatus } from '@/lib/inquiries'
import { floorsFromTop, priceFrom, unitName, unitSummary } from '@/lib/new-build'

const unit = (floor: number, letter: string, price: number, status = 'available') => ({ floor, letter, price, status, outdoorArea: 0 })

describe('el edificio', () => {
  const units = [unit(0, 'A', 250000, 'sold'), unit(1, 'B', 190000), unit(1, 'A', 220000), unit(2, 'A', 330000, 'reserved')]

  it('va del ático a la planta baja, con las letras en orden', () => {
    expect(floorsFromTop(units).map(([floor, list]) => [floor, list.map((u) => u.letter)])).toEqual([[2, ['A']], [1, ['A', 'B']], [0, ['A']]])
    expect(unitName({ floor: 2, letter: 'A' }, 2)).toBe('Ático A')
    expect(unitName({ floor: 1, letter: 'B' }, 2)).toBe('1.º B')
    expect(unitName({ floor: 0, letter: 'A' }, 2)).toBe('Bajo A')
  })

  it('calcula el precio desde con las disponibles', () => {
    expect(priceFrom(units)).toBe(190000)
    expect(priceFrom([unit(0, 'A', 250000, 'sold')])).toBeNull()
  })

  it('llama terraza o jardín a los metros exteriores según la planta', () => {
    expect(unitSummary({ ...unit(0, 'A', 0), bedrooms: 3, bathrooms: 2, area: 98, outdoorArea: 40 })).toBe('3 dormitorios · 2 baños · 98 m² útiles · Jardín de 40 m²')
    expect(unitSummary({ ...unit(4, 'D', 0), bedrooms: 1, bathrooms: 1, area: 52, outdoorArea: 5 })).toBe('1 dormitorio · 1 baño · 52 m² útiles · Terraza de 5 m²')
  })
})

describe('las peticiones y las reservas', () => {
  async function createUnits() {
    const development = await db.development.create({
      data: { name: 'Residencial de prueba', slug: 'prueba', zone: 'Benimaclet', address: 'Calle de prueba, 1', description: 'Una promoción de prueba.', floors: 2, delivery: 'verano de 2028', images: [] },
    })
    const data = { developmentId: development.id, bedrooms: 2, bathrooms: 1, area: 70, price: 200000 }

    return Promise.all([
      db.unit.create({ data: { ...data, floor: 1, letter: 'A' } }),
      db.unit.create({ data: { ...data, floor: 2, letter: 'A' } }),
      db.unit.create({ data: { ...data, floor: 0, letter: 'A', status: 'sold' } }),
    ])
  }

  beforeEach(async () => {
    await db.development.deleteMany()
    await db.contact.deleteMany()
  })

  it('crean el cliente una sola vez aunque pregunte por dos viviendas', async () => {
    const [first, second] = await createUnits()
    const nuria = { name: 'Nuria Pons', email: 'Nuria@example.test', phone: null, message: null }

    await saveInquiry(first.id, nuria)
    await saveInquiry(second.id, nuria)

    const contacts = await db.contact.findMany({ include: { inquiries: true } })
    expect(contacts).toHaveLength(1)
    expect(contacts[0].email).toBe('nuria@example.test')
    expect(contacts[0].inquiries).toHaveLength(2)
  })

  it('no admiten preguntas por una vivienda vendida', async () => {
    const [, , sold] = await createUnits()

    await expect(saveInquiry(sold.id, { name: 'Nuria', email: 'nuria@example.test', phone: null, message: null })).rejects.toThrow('ya no está a la venta')
  })

  it('reservan, venden y liberan una vivienda', async () => {
    const [first] = await createUnits()
    const marc = await db.contact.create({ data: { name: 'Marc Soler' } })

    await expect(setUnitStatus(first.id, 'reserved', null)).rejects.toThrow('elegir el cliente')
    expect((await setUnitStatus(first.id, 'reserved', marc.id)).contactId).toBe(marc.id)
    expect((await setUnitStatus(first.id, 'sold', marc.id)).status).toBe('sold')

    const released = await setUnitStatus(first.id, 'available', marc.id)
    expect(released.status).toBe('available')
    expect(released.contactId).toBeNull()
  })
})
