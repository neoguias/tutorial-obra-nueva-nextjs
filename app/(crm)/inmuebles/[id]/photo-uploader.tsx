'use client'

import { useActionState, useRef, useState } from 'react'
import { addPhotos, type FormState } from '@/app/actions'
import { FieldError } from '@/components/field-error'

/** El campo para añadir fotos, con una vista previa de las elegidas antes de subirlas. */
export function PhotoUploader({ propertyId }: { propertyId: number }) {
  const form = useRef<HTMLFormElement>(null)
  const [selected, setSelected] = useState(0)
  const [previews, setPreviews] = useState<string[]>([])
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await addPhotos(propertyId, previous, formData)
    // Con las fotos guardadas, el campo y las vistas previas quedan vacíos para las siguientes.
    if (Object.keys(result.errors).length === 0) {
      form.current?.reset()
      setSelected(0)
      setPreviews([])
    }
    return result
  }, { errors: {} })

  function preview(files: FileList | null) {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setSelected(files?.length ?? 0)
    // Un PDF elegido por error no tiene vista previa, solo las imágenes.
    setPreviews([...(files ?? [])].filter((file) => file.type.startsWith('image/')).map((file) => URL.createObjectURL(file)))
  }

  return (
    <form ref={form} action={action} className="mt-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="photos"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => preview(e.target.files)}
          className="text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 hover:file:bg-slate-200"
        />
        {selected > 0 && (
          <button disabled={pending} className="rounded bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? 'Subiendo…' : selected === 1 ? 'Guardar foto' : `Guardar ${selected} fotos`}
          </button>
        )}
      </div>
      <FieldError messages={state.errors.photos} />

      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- una vista previa local, sin nada que optimizar
            <img key={url} src={url} alt="" className="h-16 w-24 rounded object-cover opacity-80" />
          ))}
        </div>
      )}
    </form>
  )
}
