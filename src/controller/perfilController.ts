// src/controller/perfilController.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import prisma from '../prisma/client';
import { uploadBuffer, destroyAsset } from '../lib/cloudinary';

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

/* ---------------------- Helpers locales ---------------------- */

// string seguro para Prisma (evita string | undefined)
function s(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === undefined || v === null) return '';
  return String(v);
}

// slug simple (sin deps) para usar en el nombre del archivo
const simpleSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// nombre legible a partir de nombreCompleto
function buildNiceCvName(nombreCompleto?: string | null) {
  const base = (nombreCompleto?.trim() || 'perfil').slice(0, 60);
  return `CV-${simpleSlug(base)}.pdf`;
}

// inserta fl_attachment:<fileName> en una URL de Cloudinary
function addAttachmentNameToUrl(secureUrl: string, fileName = 'CV.pdf') {
  const i = secureUrl.indexOf('/upload/');
  if (i === -1) return secureUrl; // no parece de Cloudinary
  const safe = fileName.replace(/[^\w\-.]+/g, '_');
  return (
    secureUrl.slice(0, i + 8) +
    `fl_attachment:${encodeURIComponent(safe)}/` +
    secureUrl.slice(i + 8)
  );
}

// construye URL RAW desde publicId con nombre de descarga
function cvUrlFromPublicId(
  publicId: string,
  fileName = 'CV.pdf',
  cloudName = process.env.CLOUDINARY_CLOUD_NAME!
) {
  const safe = fileName.replace(/[^\w\-.]+/g, '_');
  const pid = publicId.endsWith('.pdf') ? publicId : `${publicId}.pdf`;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment:${encodeURIComponent(
    safe
  )}/${pid}`;
}

// devuelve mejor URL de descarga (cvUrl > cvPublicId) o null
function makeCvDownloadUrl(args: {
  cvUrl?: string | null;
  cvPublicId?: string | null;
  nombreCompleto?: string | null;
}) {
  const nice = buildNiceCvName(args.nombreCompleto);
  if (args.cvUrl) return addAttachmentNameToUrl(args.cvUrl, nice);
  if (args.cvPublicId) return cvUrlFromPublicId(args.cvPublicId, nice);
  return null;
}

/* ------------------- Utilidades de archivos ------------------ */

// log de ayuda para ver si Multer recibe archivos
function logFiles(req: Request) {
  const files = req.files as MulterFiles;
  const map = Object.fromEntries(
    Object.entries(files ?? {}).map(([k, arr]) => {
      const f = (arr as Express.Multer.File[] | undefined)?.[0];
      return [
        k,
        f
          ? {
              size: f.size,
              type: f.mimetype,
              hasBuffer: !!(f as any).buffer,
              hasPath: !!f.path,
            }
          : null,
      ];
    })
  );
  console.info('[perfilController] files:', map);
}

// lee buffer tanto si usas memoryStorage como diskStorage
function fileToBuffer(file?: Express.Multer.File): Buffer | null {
  if (!file) return null;
  // memoryStorage
  if ((file as any).buffer) return (file as any).buffer as Buffer;
  // diskStorage
  if (file.path && fs.existsSync(file.path)) {
    return fs.readFileSync(file.path);
  }
  return null;
}

// borra archivos temporales si usas diskStorage
function cleanupTempFiles(req: Request) {
  const files = req.files as MulterFiles;
  if (!files) return;
  for (const arr of Object.values(files)) {
    for (const f of arr) {
      if (f.path && fs.existsSync(f.path)) {
        try {
          fs.unlinkSync(f.path);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

/* ------------------------ Controladores ---------------------- */

/** GET /api/perfil */
export async function getPerfil(_req: Request, res: Response, next: NextFunction) {
  try {
    const perfiles = await prisma.perfil.findMany({ orderBy: { createdAt: 'desc' } });
    const withDownload = perfiles.map((p) => ({
      ...p,
      cvDownloadUrl: makeCvDownloadUrl({
        cvUrl: p.cvUrl,
        cvPublicId: p.cvPublicId,
        nombreCompleto: p.nombreCompleto,
      }),
    }));
    return res.json(withDownload);
  } catch (err) {
    console.error('[GET /perfil] ERROR', err);
    next(err);
  }
}

/** POST /api/perfil */
export async function createPerfil(req: Request, res: Response, next: NextFunction) {
  logFiles(req);
  try {
    const {
      nombreCompleto,
      inicialesLogo,
      telefono,
      tituloHero,
      perfilTecnicoHero,
      descripcionHero,
      descripcionUnoSobreMi,
      descripcionDosSobreMi,
    } = req.body as Partial<{
      nombreCompleto: string;
      inicialesLogo: string;
      telefono: string;
      tituloHero: string;
      perfilTecnicoHero: string;
      descripcionHero: string;
      descripcionUnoSobreMi: string;
      descripcionDosSobreMi: string;
    }>;

    // Prisma espera strings (no string | undefined) → usa s()
    const created = await prisma.perfil.create({
      data: {
        nombreCompleto: s(nombreCompleto),
        inicialesLogo: s(inicialesLogo),
        telefono: s(telefono),
        tituloHero: s(tituloHero),
        perfilTecnicoHero: s(perfilTecnicoHero),
        descripcionHero: s(descripcionHero),
        descripcionUnoSobreMi: s(descripcionUnoSobreMi),
        descripcionDosSobreMi: s(descripcionDosSobreMi),
      },
    });

    const files = req.files as MulterFiles;
    const fotoHeroBuf = fileToBuffer(files?.fotoHero?.[0]);
    const fotoSobreMiBuf = fileToBuffer(files?.fotoSobreMi?.[0]);
    const cvBuf = fileToBuffer(files?.cv?.[0]);

    const updates: Record<string, any> = {};

    if (fotoHeroBuf) {
      const up = await uploadBuffer(fotoHeroBuf, 'perfil', 'image');
      updates.fotoHeroUrl = up.url;
      updates.fotoHeroPublicId = up.public_id;
    }
    if (fotoSobreMiBuf) {
      const up = await uploadBuffer(fotoSobreMiBuf, 'perfil', 'image');
      updates.fotoSobreMiUrl = up.url;
      updates.fotoSobreMiPublicId = up.public_id;
    }
    if (cvBuf) {
      const up = await uploadBuffer(cvBuf, 'perfil', 'raw'); // PDF → raw
      updates.cvUrl = up.url;
      updates.cvPublicId = up.public_id;
    }

    const finalPerfil =
      Object.keys(updates).length > 0
        ? await prisma.perfil.update({ where: { id: created.id }, data: updates })
        : created;

    cleanupTempFiles(req);

    const response = {
      ...finalPerfil,
      cvDownloadUrl: makeCvDownloadUrl({
        cvUrl: finalPerfil.cvUrl,
        cvPublicId: finalPerfil.cvPublicId,
        nombreCompleto: finalPerfil.nombreCompleto,
      }),
    };

    return res.status(201).json(response);
  } catch (err) {
    console.error('[POST /perfil] ERROR', err);
    next(err);
  }
}

/** PUT /api/perfil */
export async function updatePerfil(req: Request, res: Response, next: NextFunction) {
  logFiles(req);
  try {
    const {
      id,
      nombreCompleto,
      inicialesLogo,
      telefono,
      tituloHero,
      perfilTecnicoHero,
      descripcionHero,
      descripcionUnoSobreMi,
      descripcionDosSobreMi,
    } = req.body as Partial<{
      id: number | string;
      nombreCompleto: string;
      inicialesLogo: string;
      telefono: string;
      tituloHero: string;
      perfilTecnicoHero: string;
      descripcionHero: string;
      descripcionUnoSobreMi: string;
      descripcionDosSobreMi: string;
    }>;

    const target = id
      ? await prisma.perfil.findUnique({ where: { id: Number(id) } })
      : await prisma.perfil.findFirst();

    if (!target) {
      cleanupTempFiles(req);
      return res.status(404).json({ message: 'Perfil no existe' });
    }

    const dataText: Record<string, any> = {};
    if (nombreCompleto !== undefined) dataText.nombreCompleto = s(nombreCompleto);
    if (inicialesLogo !== undefined) dataText.inicialesLogo = s(inicialesLogo);
    if (telefono !== undefined) dataText.telefono = s(telefono);
    if (tituloHero !== undefined) dataText.tituloHero = s(tituloHero);
    if (perfilTecnicoHero !== undefined) dataText.perfilTecnicoHero = s(perfilTecnicoHero);
    if (descripcionHero !== undefined) dataText.descripcionHero = s(descripcionHero);
    if (descripcionUnoSobreMi !== undefined) dataText.descripcionUnoSobreMi = s(descripcionUnoSobreMi);
    if (descripcionDosSobreMi !== undefined) dataText.descripcionDosSobreMi = s(descripcionDosSobreMi);

    const files = req.files as MulterFiles;
    const fotoHeroBuf = fileToBuffer(files?.fotoHero?.[0]);
    const fotoSobreMiBuf = fileToBuffer(files?.fotoSobreMi?.[0]);
    const cvBuf = fileToBuffer(files?.cv?.[0]);

    if (fotoHeroBuf) {
      const up = await uploadBuffer(fotoHeroBuf, 'perfil', 'image');
      dataText.fotoHeroUrl = up.url;
      dataText.fotoHeroPublicId = up.public_id;
      if (target.fotoHeroPublicId) {
        try {
          await destroyAsset(target.fotoHeroPublicId, 'image');
        } catch {}
      }
    }

    if (fotoSobreMiBuf) {
      const up = await uploadBuffer(fotoSobreMiBuf, 'perfil', 'image');
      dataText.fotoSobreMiUrl = up.url;
      dataText.fotoSobreMiPublicId = up.public_id;
      if (target.fotoSobreMiPublicId) {
        try {
          await destroyAsset(target.fotoSobreMiPublicId, 'image');
        } catch {}
      }
    }

    if (cvBuf) {
      const up = await uploadBuffer(cvBuf, 'perfil', 'raw');
      dataText.cvUrl = up.url;
      dataText.cvPublicId = up.public_id;
      if (target.cvPublicId) {
        try {
          await destroyAsset(target.cvPublicId, 'raw');
        } catch {}
      }
    }

    const updated = await prisma.perfil.update({
      where: { id: target.id },
      data: dataText,
    });

    cleanupTempFiles(req);

    const response = {
      ...updated,
      cvDownloadUrl: makeCvDownloadUrl({
        cvUrl: updated.cvUrl,
        cvPublicId: updated.cvPublicId,
        nombreCompleto: updated.nombreCompleto,
      }),
    };

    return res.json(response);
  } catch (err) {
    console.error('[PUT /perfil] ERROR', err);
    next(err);
  }
}

/** DELETE /api/perfil */
export async function deletePerfil(_req: Request, res: Response, next: NextFunction) {
  try {
    const current = await prisma.perfil.findFirst();
    if (!current) return res.status(404).json({ message: 'Perfil no existe' });

    try {
      if (current.fotoHeroPublicId) await destroyAsset(current.fotoHeroPublicId, 'image');
      if (current.fotoSobreMiPublicId) await destroyAsset(current.fotoSobreMiPublicId, 'image');
      if (current.cvPublicId) await destroyAsset(current.cvPublicId, 'raw');
    } catch {}

    await prisma.perfil.delete({ where: { id: current.id } });
    return res.status(204).send();
  } catch (err) {
    console.error('[DELETE /perfil] ERROR', err);
    next(err);
  }
}
