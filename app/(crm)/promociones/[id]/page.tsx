import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { euroLabel } from '@/lib/crm'
import { UNIT_CELLS, UNIT_STATUSES, unitName, unitStatus, unitSummary } from '@/lib/new-build'
import { Building } from '@/components/building'
import { UnitActions } from './unit-actions'

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ vivienda?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const development = await db.development.findUnique({ where: { id: Number((await params).id) } })

  return { title: development?.name ?? 'Promoción' }
}

/**
 * Una promoción por dentro: lo vendido y lo reservado, el edificio planta a planta y, en
 * cada vivienda, quién ha pedido información y los botones para reservarla o venderla.
 */
export default function DevelopmentPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-slate-500">Cargando promoción…</p>}>
      <DevelopmentDetails params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function DevelopmentDetails({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection()

  const development = await db.development.findUnique({
    where: { id: Number((await params).id) },
    include: { units: true },
  })

  if (!development) notFound()

  const selectedId = Number((await searchParams).vivienda) || null
  const [unit, contacts] = await Promise.all([
    selectedId
      ? db.unit.findFirst({
          where: { id: selectedId, developmentId: development.id },
          include: { contact: true, inquiries: { include: { contact: true }, orderBy: { createdAt: 'desc' } } },
        })
      : null,
    db.contact.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const count = (status: string) => development.units.filter((u) => u.status === status).length
  const revenue = development.units.filter((u) => u.status === 'sold').reduce((total, u) => total + u.price, 0)

  // Los que han preguntado por la vivienda salen los primeros en la lista de clientes.
  const interested = new Set(unit?.inquiries.map((inquiry) => inquiry.contactId))
  const sortedContacts = contacts.toSorted((a, b) => Number(interested.has(b.id)) - Number(interested.has(a.id)))

  return (
    <div>
      <Link href="/promociones" className="text-sm text-slate-500 hover:text-teal-700">← Obra nueva</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="mr-auto text-2xl font-semibold">{development.name}</h1>
        <Link href={`/obra-nueva/${development.slug}`} target="_blank" className="text-sm text-teal-700 hover:underline">Ver la ficha pública</Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          ['Vendidas', `${count('sold')} de ${development.units.length}`, ''],
          ['Reservadas', count('reserved'), 'text-amber-700'],
          ['Disponibles', count('available'), 'text-teal-700'],
          ['Importe vendido', euroLabel(revenue), ''],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <Building floors={development.floors} units={development.units} href={(u) => `?vivienda=${u.id}`} selectedId={unit?.id} />
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          {unit ? (
            <>
              <h2 className="text-lg font-semibold">{unitName(unit, development.floors)}</h2>
              <p className="mt-1 text-sm text-slate-600">{euroLabel(unit.price)} · {unitSummary(unit)}</p>
              <p className="mt-2 text-sm">
                <span className={`rounded-full px-2 py-0.5 text-xs ${UNIT_CELLS[unitStatus(unit)]}`}>{UNIT_STATUSES[unitStatus(unit)]}</span>
                {unit.contact && <span className="ml-1">a {unit.contact.name}</span>}
              </p>

              <h3 className="mt-5 text-sm font-semibold">Peticiones de información</h3>
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {unit.inquiries.map((inquiry) => (
                  <li key={inquiry.id} className="py-2">
                    <span className="font-medium">{inquiry.contact.name}</span>
                    <span className="text-slate-500"> · {inquiry.contact.email}</span>
                    {inquiry.message && <p className="text-slate-600">«{inquiry.message}»</p>}
                  </li>
                ))}
                {unit.inquiries.length === 0 && <li className="py-2 text-slate-500">Nadie ha preguntado todavía por esta vivienda.</li>}
              </ul>

              <UnitActions
                key={`${unit.id}-${unit.status}`}
                unitId={unit.id}
                status={unit.status}
                contacts={sortedContacts}
                contactId={unit.contactId ?? unit.inquiries[0]?.contactId ?? null}
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">Elige una vivienda para ver quién ha preguntado por ella y cambiar su estado.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
