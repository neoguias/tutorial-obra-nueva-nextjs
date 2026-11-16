'use client'

import { useActionState, useState } from 'react'
import { scheduleVisit, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'

type Interested = { id: number; contactId: number; name: string; summary: string }
type Contact = { id: number; name: string }

/**
 * Los clientes interesados y el formulario de la visita van juntos: el botón de cada
 * interesado deja elegido a ese cliente en el formulario.
 */
export function VisitPlanner({ propertyId, interested, contacts, emptyText }: {
  propertyId: number
  interested: Interested[]
  contacts: Contact[]
  emptyText: string
}) {
  const [contactId, setContactId] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await scheduleVisit(propertyId, previous, formData)
    // Con la visita guardada, el formulario queda listo para la siguiente.
    if (Object.keys(result.errors).length === 0) setContactId('')
    return result
  }, { errors: {} })

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Clientes que buscan algo así</h2>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {interested.map((demand) => (
            <li key={demand.id} className="flex items-center gap-4 px-4 py-3 text-sm">
              <div className="mr-auto">
                <div className="font-medium">{demand.name}</div>
                <div className="text-xs text-slate-500">{demand.summary}</div>
              </div>
              <button
                onClick={() => setContactId(String(demand.contactId))}
                className="rounded border border-teal-700 px-3 py-1 text-teal-700 hover:bg-teal-50"
              >
                Programar visita
              </button>
            </li>
          ))}
          {interested.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">{emptyText}</li>}
        </ul>
      </section>

      <form action={action} className="h-fit rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Programar visita</h2>
        <label className="block text-sm">Cliente
          <select
            name="contactId"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          >
            <option value="">Elige uno</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
          <FieldError messages={state.errors.contactId} />
        </label>
        <label className="mt-3 block text-sm">Día y hora
          <input
            name="scheduledAt"
            type="datetime-local"
            defaultValue={state.values?.scheduledAt}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          />
          <FieldError messages={state.errors.scheduledAt} />
        </label>
        <button disabled={pending} className="mt-4 w-full rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? 'Guardando…' : 'Guardar visita'}
        </button>
      </form>
    </div>
  )
}
