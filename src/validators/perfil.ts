import { z } from 'zod';

export const perfilUpsertSchema = z.object({
  nombreCompleto: z.string().min(3),
  inicialesLogo: z.string().min(1),
  telefono: z.string().optional(),
  tituloHero: z.string().optional(),
  perfilTecnicoHero: z.string().optional(),
  descripcionHero: z.string().optional(),
  descripcionUnoSobreMi: z.string(),
  descripcionDosSobreMi: z.string(),
  cvUrl: z.string().optional(),
  cvPublicId: z.string().optional(),
  fotoHeroUrl: z.string().optional(),
  fotoHeroPublicId: z.string().optional(),
  fotoSobreMiUrl: z.string().optional(),
  fotoSobreMiPublicId: z.string().optional(),
});

// Para actualizaciones parciales
export const perfilPartialSchema = perfilUpsertSchema.partial();
