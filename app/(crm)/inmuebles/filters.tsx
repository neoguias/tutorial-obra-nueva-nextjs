'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { OPERATIONS, ZONES } from '@/lib/crm'

/** Los filtros del listado. Se guardan en la dirección, así un enlace comparte también el filtro. */
export function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(name: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(name, value)
    else params.delete(name)
    router.replace(`${pathname}?${params}`)
  }

  return (
    <>
      <select
        defaultValue={searchParams.get('operation') ?? ''}
        onChange={(e) => update('operation', e.target.value)}
        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="">Venta y alquiler</option>
        {Object.entries(OPERATIONS).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get('zone') ?? ''}
        onChange={(e) => update('zone', e.target.value)}
        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="">Todas las zonas</option>
        {ZONES.map((zone) => (
          <option key={zone}>{zone}</option>
        ))}
      </select>
    </>
  )
}
