import { z } from 'zod';

export const servicioCreateSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().min(5).max(2000),
  // si llega como string desde un form, lo convertimos a number
  precio: z.coerce.number().nonnegative(),
});

export const servicioUpdateSchema = servicioCreateSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
