import { z } from 'zod';

export const proyectoCreateSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(10),
  tecnologias: z.string().min(3),
  demoUrl: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  githubUrl: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  categoriaId: z.number().int().positive().optional(),
  destacado: z.boolean().optional(),
  nivel: z.string().optional(),
});

export const proyectoUpdateSchema = proyectoCreateSchema.partial();
