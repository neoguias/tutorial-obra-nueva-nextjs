import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { markVisit } from '@/app/actions'
import { db } from '@/lib/db'
import { VISIT_OUTCOMES, dayKey, dayLabel, label, timeLabel } from '@/lib/crm'

export const metadata: Metadata = { title: 'Visitas' }

/**
 * La agenda: las visitas de hoy en adelante, agrupadas por día, y qué le pareció cada
 * inmueble al cliente cuando ya se ha hecho.
 */
export default function VisitsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Visitas</h1>
      <Suspense fallback={<p className="text-slate-500">Cargando visitas…</p>}>
        <Agenda />
      </Suspense>
    </div>
  )
}

async function Agenda() {
  // «Hoy» depende del momento de la petición, no del de la compilación.
  await connection()

  const startOfToday = new Date(`${dayKey(new Date())}T00:00`)

  const visits = await db.visit.findMany({
    where: { scheduledAt: { gte: startOfToday } },
    include: { property: true, contact: true },
    orderBy: { scheduledAt: 'asc' },
  })

  const days = Map.groupBy(visits, (visit) => dayKey(visit.scheduledAt))

  if (days.size === 0) {
    return <p className="text-slate-500">No hay visitas programadas.</p>
  }

  return [...days].map(([day, dayVisits]) => (
    <section key={day} className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{dayLabel(dayVisits[0].scheduledAt)}</h2>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {dayVisits.map((visit) => (
          <li key={visit.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
            <span className="w-12 font-mono">{timeLabel(visit.scheduledAt)}</span>
            <div className="mr-auto">
              <Link href={`/inmuebles/${visit.propertyId}`} className="font-medium text-teal-700 hover:underline">{visit.property.title}</Link>
              <div className="text-xs text-slate-500">{visit.contact.name} · {visit.property.zone}</div>
            </div>
            {visit.outcome === 'pending' ? (
              <>
                <form action={markVisit.bind(null, visit.id, 'interested')}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Le interesa</button>
                </form>
                <form action={markVisit.bind(null, visit.id, 'discarded')}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Descartado</button>
                </form>
              </>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-xs ${visit.outcome === 'interested' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                {label(VISIT_OUTCOMES, visit.outcome)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  ))
}
