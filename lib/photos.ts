import { mkdir, rm, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Las fotos se guardan fuera de public, porque Next.js solo sirve los archivos que había en
// public al compilar y una foto subida después daría un 404. Las sirve app/fotos.
export const PHOTO_DIR = path.join(process.cwd(), 'storage', 'photos')

export const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const

export const CONTENT_TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

/** Guarda la foto con un nombre aleatorio y devuelve su ruta, por ejemplo 8/3f2a….jpg. */
export async function savePhoto(propertyId: number, file: File): Promise<string> {
  const name = `${propertyId}/${crypto.randomUUID()}.${PHOTO_TYPES[file.type as keyof typeof PHOTO_TYPES]}`

  await mkdir(path.join(PHOTO_DIR, String(propertyId)), { recursive: true })
  await writeFile(path.join(PHOTO_DIR, name), Buffer.from(await file.arrayBuffer()))

  return name
}

export async function deletePhotoFile(name: string): Promise<void> {
  await unlink(path.join(PHOTO_DIR, name)).catch(() => {})
}

export async function deleteAllPhotos(): Promise<void> {
  await rm(PHOTO_DIR, { recursive: true, force: true })
}

export function photoUrl(name: string): string {
  return `/fotos/${name}`
}
