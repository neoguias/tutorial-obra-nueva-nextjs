import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { CONTENT_TYPES, PHOTO_DIR } from '@/lib/photos'

/**
 * Sirve las fotos subidas desde storage/photos. Solo acepta rutas con la forma que crea
 * savePhoto(), así que nadie puede pedir otro archivo del servidor con ../ en la URL.
 */
export async function GET(_request: Request, { params }: RouteContext<'/fotos/[property]/[file]'>) {
  const { property, file } = await params
  const extension = /^[\da-f-]+\.(jpg|png|webp)$/.exec(file)?.[1]

  if (!/^\d+$/.test(property) || !extension) {
    return new Response(null, { status: 404 })
  }

  try {
    const body = await readFile(path.join(PHOTO_DIR, property, file))

    return new Response(body, {
      headers: {
        'Content-Type': CONTENT_TYPES[extension],
        // El nombre de cada foto es único, así que el navegador puede guardarla para siempre.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
