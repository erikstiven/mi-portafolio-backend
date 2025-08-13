import { z } from 'zod';

// helper para permitir "" y convertir a undefined
const emptyToUndef = z.literal('').transform(() => undefined);

const base = {
  nombreCompleto: z.string().min(1).max(200),
  inicialesLogo:  z.string().min(1).max(10),
  telefono:       z.string().min(5).max(30),

  heroTitulo:      z.string().min(1).max(200),
  heroDescripcion: z.string().min(1).max(1000),
  heroCtaTexto:    z.string().max(100).optional().or(emptyToUndef),
  heroCtaUrl:      z.string().url().max(300).optional().or(emptyToUndef),

  sobreDescripcion: z.string().min(1).max(2000),
};

export const perfilUpsertSchema   = z.object(base);          // para crear (o primer upsert)
export const perfilPartialSchema  = z.object(base).partial(); // para updates parciales
