import { z } from 'zod'

export const ProductoImportSchema = z.object({
  id: z
    .string()
    .regex(/^CF-\d{5}$/, 'ID debe tener formato CF-XXXXX')
    .optional(),
  nombre: z.string().min(2, 'Nombre requerido').max(200).trim(),
  concentracion: z.string().max(100).optional().nullable(),
  presentacion: z.string().max(100).optional().nullable(),
  laboratorio: z.string().min(2, 'Laboratorio requerido').max(100).trim(),
  precio_contado: z
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  precio_credito: z
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  oferta: z.string().max(100).optional().nullable(),
  activo: z.boolean().default(true),
})

export const ProductoUpdateSchema = ProductoImportSchema.partial().extend({
  id: z.string().min(1, 'ID requerido'),
})

export type ProductoImportInput = z.infer<typeof ProductoImportSchema>
export type ProductoUpdateInput = z.infer<typeof ProductoUpdateSchema>
