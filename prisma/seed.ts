import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { db } from '../lib/db'
import { deleteAllPhotos, savePhoto } from '../lib/photos'

/**
 * Datos de ejemplo de Atalaya Inmobiliaria: una cartera pequeña de inmuebles, unos cuantos
 * clientes con lo que buscan y alguna visita, para tener algo que cruzar desde el principio.
 */
async function main() {
  await db.inquiry.deleteMany()
  await db.unit.deleteMany()
  await db.development.deleteMany()
  await db.visit.deleteMany()
  await db.demand.deleteMany()
  await db.contact.deleteMany()
  await db.property.deleteMany()
  await deleteAllPhotos()

  const properties: [string, string, string, string, string, number, number, number][] = [
    ['AT-101', 'Piso luminoso junto al mercado', 'sale', 'flat', 'Ruzafa', 289000, 3, 92],
    ['AT-102', 'Ático con terraza', 'sale', 'flat', 'El Carmen', 415000, 2, 78],
    ['AT-103', 'Piso para reformar', 'sale', 'flat', 'Benimaclet', 168000, 3, 85],
    ['AT-104', 'Casa de pueblo con patio', 'sale', 'house', 'Malvarrosa', 352000, 4, 140],
    ['AT-105', 'Estudio reformado', 'rent', 'flat', 'Ruzafa', 850, 1, 45],
    ['AT-106', 'Piso familiar con garaje', 'rent', 'flat', 'Campanar', 1250, 3, 110],
    ['AT-107', 'Local a pie de calle', 'rent', 'commercial', 'Patraix', 1100, 0, 120],
    ['AT-108', 'Piso exterior de cuatro dormitorios', 'sale', 'flat', 'Campanar', 325000, 4, 124],
    ['AT-109', 'Oficina con vistas', 'rent', 'office', 'El Carmen', 1450, 0, 95],
    ['AT-110', 'Bajo con jardín', 'sale', 'flat', 'Patraix', 239000, 2, 88],
  ]

  for (const [reference, title, operation, type, zone, price, bedrooms, area] of properties) {
    const property = await db.property.create({ data: { reference, title, operation, type, zone, price, bedrooms, area } })

    // Cada inmueble de ejemplo tiene su foto en prisma/photos.
    const photo = new File([await readFile(`prisma/photos/${reference}.jpg`)], `${reference}.jpg`, { type: 'image/jpeg' })
    await db.propertyPhoto.create({ data: { propertyId: property.id, path: await savePhoto(property.id, photo) } })
  }

  const lucia = await db.contact.create({
    data: { name: 'Lucía Ferrer', email: 'lucia@example.test', phone: '600 111 222', demands: { create: { operation: 'sale', type: 'flat', zone: 'Ruzafa', maxPrice: 300000, minBedrooms: 2 } } },
  })
  const marc = await db.contact.create({
    data: { name: 'Marc Soler', email: 'marc@example.test', demands: { create: { operation: 'sale', maxPrice: 340000, minBedrooms: 3, minArea: 100 } } },
  })
  await db.contact.create({
    data: { name: 'Ana Ruiz', phone: '611 333 444', demands: { create: { operation: 'rent', type: 'flat', maxPrice: 1000 } } },
  })
  await db.contact.create({
    data: { name: 'Jorge Martí', email: 'jorge@example.test', notes: 'Tiene un negocio de cerámica y busca local.', demands: { create: { operation: 'rent', type: 'commercial', maxPrice: 1200, minArea: 80 } } },
  })
  await db.contact.create({
    data: { name: 'Elena Gil', email: 'elena@example.test', demands: { create: { operation: 'sale', zone: 'El Carmen', maxPrice: 450000 } } },
  })

  const at = (days: number, hours: number, minutes: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  await db.visit.create({ data: { propertyId: (await db.property.findUniqueOrThrow({ where: { reference: 'AT-101' } })).id, contactId: lucia.id, scheduledAt: at(1, 10, 30) } })
  await db.visit.create({ data: { propertyId: (await db.property.findUniqueOrThrow({ where: { reference: 'AT-108' } })).id, contactId: marc.id, scheduledAt: at(2, 17, 0) } })

  await seedDevelopment()
}

/**
 * Una promoción de ejemplo en Benimaclet: tres bajos con jardín, cinco plantas de cuatro
 * viviendas y dos áticos, con parte ya vendida o reservada y algún cliente interesado.
 */
async function seedDevelopment() {
  const development = await db.development.create({
    data: {
      name: 'Residencial Jardines de Benimaclet',
      slug: 'jardines-de-benimaclet',
      zone: 'Benimaclet',
      address: 'Calle de Dalt, 12',
      description: 'Veinticinco viviendas de uno a tres dormitorios a cinco minutos del metro, con bajos con jardín privado, terrazas en todas las plantas y dos áticos con vistas a la huerta. Aerotermia, suelo radiante y plaza de garaje incluida.',
      floors: 6,
      delivery: 'segundo trimestre de 2028',
      images: ['fachada', 'salon', 'atico'].map((name) => `img/promociones/jardines-de-benimaclet/${name}.jpg`),
    },
  })

  // Dormitorios, baños, metros útiles y metros de terraza o jardín de cada letra.
  const typical = { A: [3, 2, 95, 9], B: [2, 2, 72, 7], C: [2, 1, 70, 7], D: [1, 1, 52, 5] }
  const layouts: Record<number, Record<string, number[]>> = {
    0: { A: [3, 2, 98, 40], B: [2, 2, 74, 25], C: [2, 1, 71, 30] },
    6: { A: [3, 2, 105, 60], B: [2, 2, 82, 45] },
  }
  const sold = ['0B', '1A', '1B', '1D', '2A', '2C', '3B', '3D', '4D', '6B']
  const reserved = ['2D', '4B', '5A']

  for (let floor = 0; floor <= development.floors; floor++) {
    for (const [letter, [bedrooms, bathrooms, area, outdoorArea]] of Object.entries(layouts[floor] ?? typical)) {
      // 3.100 €/m², un 2 % más por cada planta y 700 € por metro de terraza o jardín.
      const price = Math.round((area * 3100 * (1 + 0.02 * floor) + outdoorArea * 700) / 1000) * 1000
      const status = sold.includes(`${floor}${letter}`) ? 'sold' : reserved.includes(`${floor}${letter}`) ? 'reserved' : 'available'

      await db.unit.create({ data: { developmentId: development.id, floor, letter, bedrooms, bathrooms, area, outdoorArea, price, status } })
    }
  }

  // Algunos clientes del CRM ya se han interesado, y Marc ha reservado el 5.º A.
  const unit = (name: string) => db.unit.findFirstOrThrow({ where: { developmentId: development.id, floor: Number(name[0]), letter: name[1] } })
  const contact = (name: string) => db.contact.findFirstOrThrow({ where: { name } })
  const [marc, lucia, elena] = await Promise.all([contact('Marc Soler'), contact('Lucía Ferrer'), contact('Elena Gil')])

  await db.inquiry.create({ data: { unitId: (await unit('5A')).id, contactId: marc.id, message: '¿Se puede visitar el piso piloto?' } })
  await db.unit.update({ where: { id: (await unit('5A')).id }, data: { contactId: marc.id } })
  await db.inquiry.create({ data: { unitId: (await unit('6A')).id, contactId: marc.id } })
  await db.inquiry.create({ data: { unitId: (await unit('6A')).id, contactId: elena.id, message: 'Me interesa si la terraza da a la huerta.' } })
  await db.inquiry.create({ data: { unitId: (await unit('3C')).id, contactId: lucia.id, message: '¿La plaza de garaje entra en el precio?' } })
}

main().finally(() => db.$disconnect())
