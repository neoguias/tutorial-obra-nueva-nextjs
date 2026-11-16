'use client'

import { useActionState, useState } from 'react'
import { createContact, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'
import { OPERATIONS, PROPERTY_TYPES, ZONES } from '@/lib/crm'

const input = 'mt-1 w-full rounded border border-slate-300 px-2 py-1.5'

/**
 * Un cliente y lo que busca, en un solo formulario: en una agencia casi nadie entra en la
 * ficha si no es porque quiere comprar o alquilar algo.
 */
export function NewContactForm() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<FormState, FormData>(createContact, { errors: {} })
  const values = state.values ?? {}

  return (
    <>
      <button onClick={() => setOpen(!open)} className="rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">
        Nuevo cliente
      </button>

      {open && (
        <form action={action} className="order-last mt-2 grid w-full gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-3">
          <label className="text-sm">Nombre
            <input name="name" defaultValue={values.name} className={input} />
            <FieldError messages={state.errors.name} />
          </label>
          <label className="text-sm">Email
            <input name="email" type="email" defaultValue={values.email} className={input} />
            <FieldError messages={state.errors.email} />
          </label>
          <label className="text-sm">Teléfono
            <input name="phone" defaultValue={values.phone} className={input} />
          </label>

          <p className="text-sm font-semibold sm:col-span-3">Qué busca</p>
          <label className="text-sm">Operación
            <select name="operation" defaultValue={values.operation ?? 'sale'} className={input}>
              {Object.entries(OPERATIONS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="text-sm">Tipo
            <select name="type" defaultValue={values.type ?? ''} className={input}>
              <option value="">Cualquiera</option>
              {Object.entries(PROPERTY_TYPES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="text-sm">Zona
            <select name="zone" defaultValue={values.zone ?? ''} className={input}>
              <option value="">Cualquiera</option>
              {ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </label>
          <label className="text-sm">Precio máximo (€)
            <input name="maxPrice" type="number" defaultValue={values.maxPrice} className={input} />
            <FieldError messages={state.errors.maxPrice} />
          </label>
          <label className="text-sm">Dormitorios mínimos
            <input name="minBedrooms" type="number" defaultValue={values.minBedrooms ?? '0'} className={input} />
          </label>
          <label className="text-sm">Superficie mínima (m²)
            <input name="minArea" type="number" defaultValue={values.minArea ?? '0'} className={input} />
          </label>
          <div className="sm:col-span-3">
            <button disabled={pending} className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
              {pending ? 'Guardando…' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
