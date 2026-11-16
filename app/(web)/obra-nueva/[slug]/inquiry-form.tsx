'use client'

import { useActionState } from 'react'
import { createInquiry, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'

const input = 'mt-1 w-full rounded border border-slate-300 px-2 py-1.5'

/** El formulario para pedir información de una vivienda. Al enviarlo deja un mensaje de gracias. */
export function InquiryForm({ unitId }: { unitId: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createInquiry.bind(null, unitId), { errors: {} })
  const values = state.values ?? {}

  if (state.sent) {
    return <p className="mt-5 rounded bg-teal-50 px-3 py-2 text-sm text-teal-900">Gracias. Te escribimos en cuanto podamos con toda la información.</p>
  }

  return (
    <form action={action} className="mt-5 space-y-3">
      <label className="block text-sm">Nombre
        <input name="name" defaultValue={values.name} className={input} />
        <FieldError messages={state.errors.name} />
      </label>
      <label className="block text-sm">Email
        <input name="email" type="email" defaultValue={values.email} className={input} />
        <FieldError messages={state.errors.email} />
      </label>
      <label className="block text-sm">Teléfono (opcional)
        <input name="phone" defaultValue={values.phone} className={input} />
      </label>
      <label className="block text-sm">¿Algo que quieras preguntar?
        <textarea name="message" rows={3} defaultValue={values.message} className={input} />
        <FieldError messages={state.errors.message} />
      </label>
      <FieldError messages={state.errors.form} />
      <button disabled={pending} className="w-full rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
        {pending ? 'Enviando…' : 'Pedir información'}
      </button>
    </form>
  )
}
