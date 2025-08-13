import { z } from 'zod';

export const redCreateSchema = z.object({
  nombre: z.string().min(2).max(100),
  url: z.string().url().max(300),
  icono: z.string().min(2).max(100),
  activo: z.coerce.boolean().optional(), // default true en el controller
});

export const redUpdateSchema = redCreateSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const redesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
  includeInactive: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'true'),
});
