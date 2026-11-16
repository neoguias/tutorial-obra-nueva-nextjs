import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { euroLabel } from '@/lib/crm'
import { developmentImages, priceFromLabel, unitName, unitSummary } from '@/lib/new-build'
import { Building } from '@/components/building'
import { InquiryForm } from './inquiry-form'

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ dormitorios?: string; vivienda?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const development = await db.development.findUnique({ where: { slug: (await params).slug } })

  return { title: development?.name ?? 'Obra nueva' }
}

/**
 * La ficha pública de una promoción: fotos, datos clave, el edificio con las viviendas
 * libres planta a planta y un formulario para pedir información de cada una.
 */
export default function PromotionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500">Cargando la promoción…</p>}>
      <Promotion params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function Promotion({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection()

  const development = await db.development.findUnique({
    where: { slug: (await params).slug },
    include: { units: true },
  })

  if (!development) notFound()

  const query = await searchParams
  const bedrooms = Number(query.dormitorios) || null
  // Una vivienda vendida no se abre aunque alguien escriba su número en la dirección.
  const unit = development.units.find((u) => u.id === Number(query.vivienda) && u.status !== 'sold')
  const [cover, ...gallery] = developmentImages(development)

  // Las direcciones conservan el filtro al abrir una vivienda, y la vivienda al cambiar el filtro.
  const href = (change: { dormitorios?: number | null; vivienda?: number | null }) => {
    const search = new URLSearchParams()
    const next = { dormitorios: bedrooms, vivienda: unit?.id ?? null, ...change }
    if (next.dormitorios) search.set('dormitorios', String(next.dormitorios))
    if (next.vivienda) search.set('vivienda', String(next.vivienda))

    return `?${search}`
  }

  return (
    <div>
      <section className="relative">
        <Image src={`/${cover}`} alt={`Fachada de ${development.name}`} width={1200} height={800} priority className="h-80 w-full object-cover sm:h-[28rem]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-6 text-white">
            <p className="text-sm uppercase tracking-wide text-teal-200">Obra nueva en {development.zone}</p>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{development.name}</h1>
            <p className="mt-1 text-slate-200">{development.address} · Entrega prevista en el {development.delivery}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-lg leading-relaxed text-slate-700">{development.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {gallery.map((image) => (
                <Image key={image} src={`/${image}`} alt={`Imagen de ${development.name}`} width={600} height={400} className="aspect-[3/2] w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
          <dl className="h-fit space-y-4 rounded-lg border border-slate-200 p-5">
            <div>
              <dt className="text-sm text-slate-500">Precio</dt>
              <dd className="text-2xl font-semibold">{priceFromLabel(development.units)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Viviendas libres</dt>
              <dd className="text-lg font-medium">{development.units.filter((u) => u.status === 'available').length} de {development.units.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Dormitorios</dt>
              <dd className="text-lg font-medium">
                De {Math.min(...development.units.map((u) => u.bedrooms))} a {Math.max(...development.units.map((u) => u.bedrooms))}
              </dd>
            </div>
          </dl>
        </div>

        <h2 className="mt-12 text-2xl font-semibold">Elige tu vivienda</h2>
        <div className="mt-4 mb-5 flex flex-wrap gap-2 text-sm">
          {[null, 1, 2, 3].map((value) => (
            <Link
              key={value ?? 0}
              href={href({ dormitorios: value })}
              scroll={false}
              className={`rounded-full border px-3 py-1 ${bedrooms === value ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 hover:bg-slate-50'}`}
            >
              {value ? `${value} ${value === 1 ? 'dormitorio' : 'dormitorios'}` : 'Todas'}
            </Link>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Building
              floors={development.floors}
              units={development.units}
              href={(u) => href({ vivienda: u.id })}
              isPublic
              bedrooms={bedrooms}
              selectedId={unit?.id}
            />
          </div>

          <aside className="h-fit rounded-lg border border-slate-200 p-5">
            {unit ? (
              <>
                <h3 className="text-lg font-semibold">{unitName(unit, development.floors)}</h3>
                <p className="mt-1 text-2xl font-semibold">{euroLabel(unit.price)}</p>
                <p className="mt-1 text-sm text-slate-600">{unitSummary(unit)}</p>
                {unit.status === 'reserved' && (
                  <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">Está reservada. Si te interesa, déjanos tus datos y te avisamos si vuelve a quedar libre.</p>
                )}
                <InquiryForm key={unit.id} unitId={unit.id} />
              </>
            ) : (
              <p className="text-sm text-slate-500">Elige una vivienda en el edificio para ver sus datos y pedir información.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
