import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { OPERATIONS, PROPERTY_TYPES, VISIT_OUTCOMES, dayLabel, euroLabel, label, priceLabel, timeLabel } from '@/lib/crm'
import { demandsMatching } from '@/lib/matching'
import { photoUrl } from '@/lib/photos'
import { DeletePhotoButton } from './delete-photo-button'
import { PhotoUploader } from './photo-uploader'
import { StatusForm } from './status-form'
import { VisitPlanner } from './visit-planner'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const property = await db.property.findUnique({ where: { id: Number((await params).id) } })

  return { title: property?.title ?? 'Inmueble' }
}

/**
 * La ficha de un inmueble: sus datos y sus fotos, los clientes cuya demanda encaja con él y
 * las visitas, con un formulario para programar la siguiente.
 */
export default function PropertyPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="text-slate-500">Cargando inmueble…</p>}>
      <PropertyDetails params={params} />
    </Suspense>
  )
}

async function PropertyDetails({ params }: { params: Params }) {
  await connection()

  const property = await db.property.findUnique({
    where: { id: Number((await params).id) },
    include: {
      photos: { orderBy: { position: 'asc' } },
      visits: { include: { contact: true }, orderBy: { scheduledAt: 'asc' } },
    },
  })

  if (!property) notFound()

  const [interested, contacts] = await Promise.all([
    db.demand.findMany({ where: demandsMatching(property), include: { contact: true } }),
    db.contact.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div>
      <Link href="/inmuebles" className="text-sm text-slate-500 hover:text-teal-700">← Inmuebles</Link>
      <h1 className="mt-2 text-2xl font-semibold">{property.title}</h1>
      <p className="mt-1 text-slate-600">
        <span className="font-mono text-xs">{property.reference}</span> · {label(OPERATIONS, property.operation)} ·{' '}
        {label(PROPERTY_TYPES, property.type)} en {property.zone} · {property.bedrooms > 0 && `${property.bedrooms} dorm. · `}
        {property.area} m² · <strong>{priceLabel(property)}</strong>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-[66%]">
        {property.photos.map((photo, i) => (
          <figure key={photo.id} className="group relative">
            <Image src={photoUrl(photo.path)} alt={property.title} width={480} height={320} className="aspect-[3/2] w-full rounded-lg object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs font-medium">Portada</span>}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 has-[form]:opacity-100">
              <DeletePhotoButton photoId={photo.id} />
            </div>
          </figure>
        ))}
      </div>
      <PhotoUploader propertyId={property.id} />

      <StatusForm propertyId={property.id} status={property.status} />

      <div className="mt-8">
        <VisitPlanner
          propertyId={property.id}
          contacts={contacts}
          emptyText={property.status === 'available' ? 'Ningún cliente busca algo así todavía.' : 'Solo se cruzan los inmuebles disponibles.'}
          interested={interested.map((demand) => ({
            id: demand.id,
            contactId: demand.contactId,
            name: demand.contact.name,
            summary: `Hasta ${euroLabel(demand.maxPrice)} · ${demand.zone ?? 'cualquier zona'}`,
          }))}
        />
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Visitas</h2>
      <ul className="space-y-2 text-sm">
        {property.visits.map((visit) => (
          <li key={visit.id} className="rounded border border-slate-200 bg-white px-3 py-2">
            {dayLabel(visit.scheduledAt)}, {timeLabel(visit.scheduledAt)} · {visit.contact.name}{' '}
            <span className="text-xs text-slate-500">({label(VISIT_OUTCOMES, visit.outcome)})</span>
          </li>
        ))}
        {property.visits.length === 0 && <li className="text-slate-500">Sin visitas todavía.</li>}
      </ul>
    </div>
  )
}
