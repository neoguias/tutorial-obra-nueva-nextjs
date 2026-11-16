'use client'

import { updateStatus } from '@/app/actions'
import { PROPERTY_STATUSES } from '@/lib/crm'

/** Cambia el estado en cuanto eliges otro: no hace falta un botón de guardar. */
export function StatusForm({ propertyId, status }: { propertyId: number; status: string }) {
  return (
    <form action={updateStatus.bind(null, propertyId)} className="mt-4 inline-flex items-center gap-2 text-sm">
      <label htmlFor="status">Estado</label>
      <select
        id="status"
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
      >
        {Object.entries(PROPERTY_STATUSES).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </form>
  )
}
