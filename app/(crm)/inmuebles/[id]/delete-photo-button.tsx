'use client'

import { useState } from 'react'
import { deletePhoto } from '@/app/actions'

/** Borrar pide una segunda pulsación, para que un clic perdido no se lleve una foto. */
export function DeletePhotoButton({ photoId }: { photoId: number }) {
  const [confirming, setConfirming] = useState(false)
  const style = 'rounded bg-white/90 px-2 py-0.5 text-xs'

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${style} text-red-700`}>
        Eliminar
      </button>
    )
  }

  return (
    <form action={deletePhoto.bind(null, photoId)} className="flex gap-1">
      <button className={`${style} font-medium text-red-700`}>¿Eliminar?</button>
      <button type="button" onClick={() => setConfirming(false)} className={style}>No</button>
    </form>
  )
}
