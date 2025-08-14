import { z } from 'zod';

export const proyectoCreateSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tecnologias: z.string().min(3, 'Las tecnologías deben tener al menos 3 caracteres'),

  demoUrl: z
    .string()
    .url('La URL de demo no es válida')
    .or(z.literal(''))
    .optional()
    .transform(v => v || undefined),

  githubUrl: z
    .string()
    .url('La URL de GitHub no es válida')
    .or(z.literal(''))
    .optional()
    .transform(v => v || undefined),

  categoriaId: z
    .preprocess(val => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? undefined : num;
    }, z.number().int().positive().optional()),

  destacado: z
    .preprocess(val => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return undefined;
    }, z.boolean().optional()),

  nivel: z.string().optional(),
});

export const proyectoUpdateSchema = proyectoCreateSchema.partial();
