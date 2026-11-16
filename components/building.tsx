import Link from 'next/link'
import { UNIT_CELLS, UNIT_STATUSES, floorLabel, floorsFromTop, unitStatus } from '@/lib/new-build'

type Unit = { id: number; floor: number; letter: string; bedrooms: number; area: number; status: string; price: number; outdoorArea: number }

type Props = {
  floors: number
  units: Unit[]
  /** La dirección que abre cada vivienda. */
  href: (unit: Unit) => string
  /** En la ficha pública las vendidas no se pueden abrir. */
  isPublic?: boolean
  /** Con un filtro de dormitorios, las que no encajan se quedan en segundo plano. */
  bedrooms?: number | null
  selectedId?: number | null
}

/** El edificio planta a planta, de arriba abajo, con una casilla por vivienda del color de su estado. */
export function Building({ floors, units, href, isPublic = false, bedrooms = null, selectedId = null }: Props) {
  return (
    <div>
      <div className="space-y-1.5">
        {floorsFromTop(units).map(([floor, floorUnits]) => (
          <div key={floor} className="flex items-stretch gap-1.5">
            <span className="flex w-14 shrink-0 items-center justify-end text-xs text-slate-500">{floorLabel(floor, floors)}</span>
            {floorUnits.map((unit) => {
              const status = unitStatus(unit)
              const className = [
                'flex-1 rounded px-2 py-2.5 text-center text-sm font-semibold transition',
                UNIT_CELLS[status],
                bedrooms && unit.bedrooms !== bedrooms ? 'opacity-25' : '',
                unit.id === selectedId ? 'ring-2 ring-slate-900 ring-offset-2' : '',
              ].join(' ')
              const content = (
                <>
                  {unit.letter}
                  <span className="block text-xs font-normal">{unit.bedrooms} dorm. · {unit.area} m²</span>
                </>
              )

              return isPublic && status === 'sold'
                ? <span key={unit.id} className={`${className} cursor-not-allowed`}>{content}</span>
                : <Link key={unit.id} href={href(unit)} scroll={false} className={className}>{content}</Link>
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        {Object.entries(UNIT_STATUSES).map(([status, text]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={`size-3 rounded-sm ${UNIT_CELLS[status as keyof typeof UNIT_CELLS]}`} />
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
