import { z } from 'zod'

const rucRegex = /^\d{11}$/

export const CrearClienteSchema = z.object({
  nombre_farmacia: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(120, 'Máximo 120 caracteres')
    .trim(),
  ruc: z
    .string()
    .regex(rucRegex, 'El RUC debe tener 11 dígitos')
    .optional()
    .or(z.literal('')),
  direccion: z.string().max(200).optional(),
  distrito: z.string().max(80).optional(),
  ciudad: z.string().default('Lima'),
  telefono: z
    .string()
    .regex(/^\+?\d{7,15}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
})

export type CrearClienteInput = z.infer<typeof CrearClienteSchema>
