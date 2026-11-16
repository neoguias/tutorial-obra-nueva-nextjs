import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { PROPERTY_STATUSES, PROPERTY_TYPES, label, priceLabel } from '@/lib/crm'
import { demandsMatching } from '@/lib/matching'
import { photoUrl } from '@/lib/photos'
import { Filters } from './filters'
import { NewPropertyForm } from './new-property-form'

export const metadata: Metadata = { title: 'Inmuebles' }

type Search = Promise<{ operation?: string; zone?: string }>

/**
 * La cartera de la agencia: los inmuebles con sus filtros, el alta de uno nuevo y, en cada
 * fila, cuántos clientes buscan justo algo así.
 */
export default function PropertiesPage({ searchParams }: { searchParams: Search }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">Inmuebles</h1>
        <Suspense>
          <Filters />
        </Suspense>
        <NewPropertyForm />
      </div>

      <Suspense fallback={<p className="text-slate-500">Cargando inmuebles…</p>}>
        <PropertyTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function PropertyTable({ searchParams }: { searchParams: Search }) {
  await connection()
  const { operation, zone } = await searchParams

  const properties = await db.property.findMany({
    where: { ...(operation ? { operation } : {}), ...(zone ? { zone } : {}) },
    // La portada es la primera foto de cada inmueble.
    include: { photos: { orderBy: { position: 'asc' }, take: 1 } },
    orderBy: { reference: 'asc' },
  })

  const interested = await Promise.all(
    properties.map((property) => db.demand.count({ where: demandsMatching(property) })),
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Ref.</th>
            <th className="px-4 py-3">Inmueble</th>
            <th className="px-4 py-3">Zona</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Interesados</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, i) => (
            <tr key={property.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-mono text-xs">{property.reference}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {property.photos[0] ? (
                    <Image src={photoUrl(property.photos[0].path)} alt="" width={72} height={48} className="h-12 w-18 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-18 rounded bg-slate-100" />
                  )}
                  <div>
                    <Link href={`/inmuebles/${property.id}`} className="font-medium text-teal-700 hover:underline">
                      {property.title}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {label(PROPERTY_TYPES, property.type)} · {property.bedrooms > 0 && `${property.bedrooms} dorm. · `}{property.area} m²
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{property.zone}</td>
              <td className="whitespace-nowrap px-4 py-3">{priceLabel(property)}</td>
              <td className="px-4 py-3">{label(PROPERTY_STATUSES, property.status)}</td>
              <td className="px-4 py-3">{interested[i]}</td>
            </tr>
          ))}
          {properties.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No hay inmuebles con esos filtros.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
