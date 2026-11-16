import { db } from './db'
import type { UnitStatus } from './new-build'

type InquiryData = { name: string; email: string; phone: string | null; message: string | null }

/**
 * Guarda una petición de información. Si el email ya es de un cliente del CRM, se suma a su
 * ficha en lugar de crear otro cliente repetido. Las viviendas vendidas no admiten peticiones.
 */
export async function saveInquiry(unitId: number, data: InquiryData) {
  const unit = await db.unit.findUnique({ where: { id: unitId } })
  if (!unit || unit.status === 'sold') {
    throw new Error('Esa vivienda ya no está a la venta.')
  }

  const email = data.email.toLowerCase()
  const contact = (await db.contact.findFirst({ where: { email } }))
    ?? await db.contact.create({ data: { name: data.name, email, phone: data.phone } })

  return db.inquiry.create({ data: { unitId, contactId: contact.id, message: data.message } })
}

/** Reserva, vende o vuelve a poner a la venta una vivienda. Solo la última se queda sin cliente. */
export async function setUnitStatus(unitId: number, status: UnitStatus, contactId: number | null) {
  if (status !== 'available' && !contactId) {
    throw new Error('Para reservar o vender hay que elegir el cliente.')
  }

  return db.unit.update({
    where: { id: unitId },
    data: { status, contactId: status === 'available' ? null : contactId },
  })
}
