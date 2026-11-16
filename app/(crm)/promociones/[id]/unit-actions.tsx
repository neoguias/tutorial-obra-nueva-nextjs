'use client'

import { useActionState } from 'react'
import { updateUnitStatus, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'

type Props = {
  unitId: number
  status: string
  contacts: { id: number; name: string }[]
  /** El cliente que aparece elegido: quien la tiene o el último que ha preguntado. */
  contactId: number | null
}

/**
 * Los botones para reservar, vender o liberar una vivienda. Comparten formulario, y cada
 * botón manda su estado en el campo status.
 */
export function UnitActions({ unitId, status, contacts, contactId }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateUnitStatus.bind(null, unitId), { errors: {} })

  return (
    <form action={action} className="mt-5 space-y-3">
      {status !== 'sold' && (
        <label className="block text-sm">Cliente
          <select name="contactId" defaultValue={contactId ?? ''} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5">
            <option value="">Elige uno</option>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
          <FieldError messages={state.errors.contactId} />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {status === 'available' && (
          <button name="status" value="reserved" disabled={pending} className="rounded border border-amber-400 px-3 py-2 text-sm text-amber-900 hover:bg-amber-50">Reservar</button>
        )}
        {status !== 'sold' && (
          <button name="status" value="sold" disabled={pending} className="rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">Marcar como vendida</button>
        )}
        {status !== 'available' && (
          <button name="status" value="available" disabled={pending} className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Volver a poner a la venta</button>
        )}
      </div>
    </form>
  )
}
