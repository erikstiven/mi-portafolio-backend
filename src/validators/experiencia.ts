import { z } from 'zod';

const emptyToUndef = z.literal('').transform(() => undefined);

// Campos base
const base = {
  puesto: z.string().min(2).max(120),
  empresa: z.string().min(2).max(120),
  descripcion: z.string().min(5).max(3000),

  // Acepta ISO string/Date; convierte a Date
  fechaInicio: z.coerce.date(),

  // Permite '' => undefined; si llega algo válido lo convierte a Date
  fechaFin: z
    .union([z.coerce.date(), emptyToUndef])
    .optional()
    .transform((v) => (v instanceof Date ? v : undefined)),

  // Acepta "true"/"false" (string) o boolean
  actualmente: z.coerce.boolean().default(false),
};

// CREATE: requiere todos (menos fechaFin)
export const experienciaCreateSchema = z
  .object(base)
  .superRefine((val, ctx) => {
    // Si actualmente = true => no debe venir fechaFin
    if (val.actualmente && val.fechaFin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'Si "actualmente" es true, no debe enviarse "fechaFin".',
      });
    }
    // Si viene fechaFin, debe ser >= fechaInicio
    if (val.fechaFin && val.fechaFin < val.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'La "fechaFin" no puede ser anterior a "fechaInicio".',
      });
    }
  });

// UPDATE: parcial; validamos reglas solo si mandan ambos campos
export const experienciaUpdateSchema = z
  .object({
    ...Object.fromEntries(Object.entries(base).map(([k, v]) => [k, (v as any).optional?.() ?? v.optional()])),
  })
  .superRefine((val, ctx) => {
    if (val.actualmente === true && typeof val.fechaFin !== 'undefined' && val.fechaFin !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'Si "actualmente" es true, no debe enviarse "fechaFin".',
      });
    }
    if (val.fechaInicio && val.fechaFin && val.fechaFin < val.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'La "fechaFin" no puede ser anterior a "fechaInicio".',
      });
    }
  });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const experienciasQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
  soloActuales: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'true'),
});
