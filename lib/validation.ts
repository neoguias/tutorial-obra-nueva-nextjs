import { z } from 'zod'
import { OPERATIONS, PROPERTY_STATUSES, PROPERTY_TYPES, ZONES } from './crm'
import { UNIT_STATUSES } from './new-build'
import { PHOTO_TYPES } from './photos'

const keys = <T extends Record<string, string>>(labels: T) => Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]]

// Un campo opcional del formulario llega como texto vacío: lo guardamos como null.
const emptyAsNull = (value: unknown) => (value === '' ? null : value)

const whole = (message: string) => z.coerce.number({ error: message }).int({ error: message })

export const propertySchema = z.object({
  reference: z.string().trim().min(1, 'Rellena la referencia.').max(20, 'La referencia no puede tener más de 20 caracteres.'),
  title: z.string().trim().min(1, 'Rellena el título.').max(120, 'El título no puede tener más de 120 caracteres.'),
  operation: z.enum(keys(OPERATIONS), { error: 'Elige la operación de la lista.' }),
  type: z.enum(keys(PROPERTY_TYPES), { error: 'Elige el tipo de la lista.' }),
  zone: z.enum(ZONES, { error: 'Rellena la zona.' }),
  price: whole('Rellena el precio.').positive('Rellena el precio.'),
  bedrooms: whole('Los dormitorios tienen que ser un número entero.').min(0).max(20, 'Los dormitorios no pueden pasar de 20.'),
  area: whole('Rellena la superficie.').positive('Rellena la superficie.'),
})

export const statusSchema = z.enum(keys(PROPERTY_STATUSES))

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Rellena el nombre.').max(120, 'El nombre no puede tener más de 120 caracteres.'),
  email: z.preprocess(emptyAsNull, z.email('Ese email no es válido.').nullable()),
  phone: z.preprocess(emptyAsNull, z.string().trim().max(30).nullable()),
  operation: z.enum(keys(OPERATIONS), { error: 'Elige la operación de la lista.' }),
  type: z.preprocess(emptyAsNull, z.enum(keys(PROPERTY_TYPES)).nullable()),
  zone: z.preprocess(emptyAsNull, z.enum(ZONES).nullable()),
  maxPrice: whole('Rellena el precio máximo.').positive('Rellena el precio máximo.'),
  minBedrooms: whole('Los dormitorios mínimos tienen que ser un número entero.').min(0).max(20),
  minArea: whole('La superficie mínima tiene que ser un número entero.').min(0),
})

export const visitSchema = z.object({
  contactId: whole('Rellena el cliente.').positive('Rellena el cliente.'),
  scheduledAt: z.coerce
    .date({ error: 'Rellena la fecha de la visita.' })
    .refine((date) => date > new Date(), 'La fecha de la visita tiene que ser posterior a ahora.'),
})

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Dinos tu nombre.').max(120, 'El nombre no puede tener más de 120 caracteres.'),
  email: z.email('Necesitamos un email válido para responderte.'),
  phone: z.preprocess(emptyAsNull, z.string().trim().max(30).nullable()),
  message: z.preprocess(emptyAsNull, z.string().trim().max(1000, 'El mensaje no puede tener más de 1.000 caracteres.').nullable()),
})

export const unitStatusSchema = z.object({
  status: z.enum(keys(UNIT_STATUSES)),
  contactId: z.preprocess(emptyAsNull, z.coerce.number().int().positive().nullable()),
})

// Un campo de archivos sin nada elegido llega como un archivo vacío, que quitamos antes de validar.
export const photosSchema = z.preprocess(
  (files) => (files as unknown[]).filter((file) => file instanceof File && file.size > 0),
  z
    .array(
      z
        .file()
        .mime(Object.keys(PHOTO_TYPES), { error: 'Las fotos tienen que ser JPG, PNG o WebP.' })
        .max(5 * 1024 * 1024, { error: 'Cada foto puede ocupar como máximo 5 MB.' }),
    )
    .min(1, 'Elige al menos una foto.')
    .max(6, 'Sube como máximo 6 fotos a la vez.'),
)

export type FieldErrors = Record<string, string[] | undefined>

/** Los errores de Zod con el nombre del campo, para pintarlos debajo de cada uno. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors
}
