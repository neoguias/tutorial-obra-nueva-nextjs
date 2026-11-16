'use client'

import { useActionState, useState } from 'react'
import { createProperty, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'
import { OPERATIONS, PROPERTY_TYPES, ZONES } from '@/lib/crm'

const input = 'mt-1 w-full rounded border border-slate-300 px-2 py-1.5'

export function NewPropertyForm() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<FormState, FormData>(createProperty, { errors: {} })
  const values = state.values ?? {}

  return (
    <>
      <button onClick={() => setOpen(!open)} className="rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">
        Nuevo inmueble
      </button>

      {open && (
        <form action={action} className="order-last mt-2 grid w-full gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-4">
          <label className="text-sm">Referencia
            <input name="reference" defaultValue={values.reference} className={input} />
            <FieldError messages={state.errors.reference} />
          </label>
          <label className="text-sm sm:col-span-3">Título
            <input name="title" defaultValue={values.title} className={input} />
            <FieldError messages={state.errors.title} />
          </label>
          <label className="text-sm">Operación
            <select name="operation" defaultValue={values.operation ?? 'sale'} className={input}>
              {Object.entries(OPERATIONS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="text-sm">Tipo
            <select name="type" defaultValue={values.type ?? 'flat'} className={input}>
              {Object.entries(PROPERTY_TYPES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="text-sm">Zona
            <select name="zone" defaultValue={values.zone ?? ''} className={input}>
              <option value="">Elige una</option>
              {ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
            <FieldError messages={state.errors.zone} />
          </label>
          <label className="text-sm">Precio (€)
            <input name="price" type="number" defaultValue={values.price} className={input} />
            <FieldError messages={state.errors.price} />
          </label>
          <label className="text-sm">Dormitorios
            <input name="bedrooms" type="number" defaultValue={values.bedrooms ?? '2'} className={input} />
            <FieldError messages={state.errors.bedrooms} />
          </label>
          <label className="text-sm">Superficie (m²)
            <input name="area" type="number" defaultValue={values.area} className={input} />
            <FieldError messages={state.errors.area} />
          </label>
          <div className="flex items-end sm:col-span-2">
            <button disabled={pending} className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
              {pending ? 'Guardando…' : 'Guardar inmueble'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
