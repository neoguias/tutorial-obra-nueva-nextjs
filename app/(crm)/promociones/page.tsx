import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { developmentImages } from '@/lib/new-build'

export const metadata: Metadata = { title: 'Obra nueva' }

/** Las promociones de obra nueva que lleva la agencia, con lo vendido de cada una. */
export default function DevelopmentsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Obra nueva</h1>
      <Suspense fallback={<p className="text-slate-500">Cargando promociones…</p>}>
        <DevelopmentList />
      </Suspense>
    </div>
  )
}

async function DevelopmentList() {
  await connection()

  const developments = await db.development.findMany({
    include: { units: { select: { status: true, _count: { select: { inquiries: true } } } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {developments.map((development) => {
        const sold = development.units.filter((unit) => unit.status === 'sold').length
        const inquiries = development.units.reduce((total, unit) => total + unit._count.inquiries, 0)

        return (
          <Link key={development.id} href={`/promociones/${development.id}`} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:border-teal-600">
            <Image src={`/${developmentImages(development)[0]}`} alt="" width={144} height={96} className="h-24 w-36 rounded object-cover" />
            <div>
              <h2 className="font-semibold">{development.name}</h2>
              <p className="text-sm text-slate-500">{development.zone} · Entrega en el {development.delivery}</p>
              <p className="mt-2 text-sm">{sold} de {development.units.length} vendidas · {inquiries} peticiones de información</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
