import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { processPerfilUpsert } from '../services/perfilService';
import { perfilUpsertSchema, perfilPartialSchema } from '../validators/perfil';

export const getPerfil = async (_req: Request, res: Response) => {
  try {
    const perfil = await prisma.perfil.findUnique({ where: { id: 1 } });
    if (!perfil) return res.status(404).json({ message: 'Perfil no encontrado' });
    return res.json(perfil);
  } catch (error) {
    console.error('[getPerfil] Error:', error);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

// PUT /api/perfil  (JSON puro, sin archivos)  -> upsert id=1
export const updatePerfil = async (req: Request, res: Response) => {
  try {
    // si no existe exigimos todos los campos; si existe, permitimos parcial
    const exists = await prisma.perfil.findUnique({ where: { id: 1 } });
    const parsed = (exists ? perfilPartialSchema : perfilUpsertSchema).parse(req.body);

    // sólo los campos presentes (evita pisar con undefined)
    const data: Record<string, unknown> = {};
    for (const k of Object.keys(parsed)) {
      const v = (parsed as any)[k];
      if (v !== undefined) data[k] = v;
    }

    const perfil = await prisma.perfil.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...(parsed as any) },
    });

    return res.json(perfil);
  } catch (error) {
    console.error('[updatePerfil] Error:', error);
    return res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

// POST /api/perfil/assets  (multipart/form-data) -> sube a Cloudinary + upsert
export const uploadPerfilAssets = async (req: Request, res: Response) => {
  try {
    const exists = await prisma.perfil.findUnique({ where: { id: 1 } });
    const parsed = (exists ? perfilPartialSchema : perfilUpsertSchema).parse(req.body);

    const files = (req as any).files as {
      [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const perfil = await processPerfilUpsert({
      // textos (solo los presentes)
      ...(parsed as any),
      // archivos (opcionales)
      fotoBuffer: files?.foto?.[0]?.buffer,
      logoBuffer: files?.logo?.[0]?.buffer,
      cvBuffer:   files?.cv?.[0]?.buffer,
    });

    return res.json(perfil);
  } catch (error: any) {
    console.error('[uploadPerfilAssets] Error:', error);
    return res.status(500).json({ message: error?.message || 'Error al subir/actualizar perfil' });
  }
};
