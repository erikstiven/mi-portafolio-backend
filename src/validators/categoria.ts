import { z } from 'zod';

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(2).max(60),
});

export const categoriaUpdateSchema = categoriaCreateSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
