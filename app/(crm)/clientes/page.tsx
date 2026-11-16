import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { OPERATIONS, PROPERTY_TYPES, euroLabel, label, priceLabel } from '@/lib/crm'
import { propertiesMatching } from '@/lib/matching'
import type { Demand } from '@/app/generated/prisma/client'
import { NewContactForm } from './new-contact-form'

export const metadata: Metadata = { title: 'Clientes' }

/**
 * Los clientes de la agencia con lo que busca cada uno y los inmuebles de la cartera que le
 * encajan ahora mismo.
 */
export default function ContactsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Clientes</h1>
        <NewContactForm />
      </div>

      <Suspense fallback={<p className="text-slate-500">Cargando clientes…</p>}>
        <ContactList />
      </Suspense>
    </div>
  )
}

function describe(demand: Demand): string {
  const parts = [
    `Busca ${demand.type ? label(PROPERTY_TYPES, demand.type).toLowerCase() : 'cualquier inmueble'} en ${label(OPERATIONS, demand.operation).toLowerCase()}`,
    demand.zone ? `en ${demand.zone}` : 'en cualquier zona',
    `hasta ${euroLabel(demand.maxPrice)}`,
  ]

  return parts.join(', ')
    + (demand.minBedrooms ? ` · ${demand.minBedrooms}+ dorm.` : '')
    + (demand.minArea ? ` · ${demand.minArea}+ m²` : '')
}

async function ContactList() {
  // SQLite responde al momento y Next.js daría la página por estática: la leemos en cada petición.
  await connection()

  const contacts = await db.contact.findMany({ include: { demands: true }, orderBy: { name: 'asc' } })

  const matches = await Promise.all(
    contacts.flatMap((contact) => contact.demands).map(async (demand) => [
      demand.id,
      await db.property.findMany({ where: propertiesMatching(demand), orderBy: { price: 'asc' } }),
    ] as const),
  )
  const matchesByDemand = new Map(matches)

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <article key={contact.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="font-semibold">{contact.name}</h2>
            <span className="text-sm text-slate-500">{[contact.email, contact.phone].filter(Boolean).join(' · ')}</span>
          </div>

          {contact.demands.map((demand) => (
            <div key={demand.id}>
              <p className="mt-2 text-sm text-slate-600">{describe(demand)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {matchesByDemand.get(demand.id)?.map((property) => (
                  <Link key={property.id} href={`/inmuebles/${property.id}`} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800 hover:bg-teal-100">
                    {property.reference} · {priceLabel(property)}
                  </Link>
                ))}
                {matchesByDemand.get(demand.id)?.length === 0 && <span className="text-xs text-slate-400">Nada en cartera por ahora.</span>}
              </div>
            </div>
          ))}
        </article>
      ))}
    </div>
  )
}
