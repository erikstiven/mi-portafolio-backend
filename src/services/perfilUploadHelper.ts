import prisma from '../prisma/client';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

// ⚠️ asegúrate de tener CLOUDINARY_* en el .env del BACKEND
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

interface ProcessPerfilUpsertParams {
  perfilId: number;
  nombreCompleto?: string;
  inicialesLogo?: string;
  telefono?: string;
  tituloHero?: string;
  perfilTecnicoHero?: string;
  descripcionHero?: string;
  descripcionUnoSobreMi?: string;
  descripcionDosSobreMi?: string;
  fotoHeroBuffer?: Buffer;
  fotoSobreMiBuffer?: Buffer;
  cvBuffer?: Buffer;
}

/** Subida genérica desde Buffer a Cloudinary */
const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No se obtuvo respuesta de Cloudinary'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/* ===================== NUEVOS HELPERS ===================== */

/** slug simple (sin dependencias) para armar nombre de archivo */
const simpleSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/** Genera un nombre bonito para el CV a partir del nombre completo */
export function buildNiceCvName(nombreCompleto?: string | null) {
  const base = (nombreCompleto?.trim() || 'perfil').slice(0, 60);
  return `CV-${simpleSlug(base)}.pdf`;
}

/** Inserta fl_attachment:<fileName> en una URL de Cloudinary existente */
export function addAttachmentNameToUrl(secureUrl: string, fileName = 'CV.pdf') {
  const i = secureUrl.indexOf('/upload/');
  if (i === -1) return secureUrl; // no parece de Cloudinary
  const safe = fileName.replace(/[^\w\-.]+/g, '_');
  return (
    secureUrl.slice(0, i + 8) +
    `fl_attachment:${encodeURIComponent(safe)}/` +
    secureUrl.slice(i + 8)
  );
}

/** Construye una URL RAW desde publicId con nombre de descarga */
export function cvUrlFromPublicId(
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

/** ✅ Devuelve la mejor URL de descarga (PRIMERO publicId, luego url) */
export function makeCvDownloadUrl(args: {
  cvUrl?: string | null;
  cvPublicId?: string | null;
  nombreCompleto?: string | null;
}) {
  const nice = buildNiceCvName(args.nombreCompleto);
  // 1) Preferimos publicId para poder asegurar la extensión .pdf
  if (args.cvPublicId) return cvUrlFromPublicId(args.cvPublicId, nice);
  // 2) Fallback: si no hay publicId, modificamos la url existente
  if (args.cvUrl) return addAttachmentNameToUrl(args.cvUrl, nice);
  return null;
}

/* ===================== UPSERT PERFIL ===================== */

export const processPerfilUpsert = async (params: ProcessPerfilUpsertParams) => {
  const {
    perfilId,
    nombreCompleto,
    inicialesLogo,
    telefono,
    tituloHero,
    perfilTecnicoHero,
    descripcionHero,
    descripcionUnoSobreMi,
    descripcionDosSobreMi,
    fotoHeroBuffer,
    fotoSobreMiBuffer,
    cvBuffer,
  } = params;

  const dataToUpdate: Record<string, any> = {
    nombreCompleto,
    inicialesLogo,
    telefono,
    tituloHero,
    perfilTecnicoHero,
    descripcionHero,
    descripcionUnoSobreMi,
    descripcionDosSobreMi,
  };

  if (fotoHeroBuffer && fotoHeroBuffer.length > 0) {
    try {
      const up = await uploadBufferToCloudinary(
        fotoHeroBuffer, 'perfil', `fotoHero_${perfilId}`, 'image'
      );
      dataToUpdate.fotoHeroUrl = up.secure_url;
      dataToUpdate.fotoHeroPublicId = up.public_id;
    } catch (e: any) {
      console.error('[Cloudinary][fotoHero] ERROR', e?.message || e);
    }
  }

  if (fotoSobreMiBuffer && fotoSobreMiBuffer.length > 0) {
    try {
      const up = await uploadBufferToCloudinary(
        fotoSobreMiBuffer, 'perfil', `fotoSobreMi_${perfilId}`, 'image'
      );
      dataToUpdate.fotoSobreMiUrl = up.secure_url;
      dataToUpdate.fotoSobreMiPublicId = up.public_id;
    } catch (e: any) {
      console.error('[Cloudinary][fotoSobreMi] ERROR', e?.message || e);
    }
  }

  if (cvBuffer && cvBuffer.length > 0) {
    try {
      const up = await uploadBufferToCloudinary(
        cvBuffer, 'perfil', `cv_${perfilId}`, 'raw' // PDF como RAW
      );
      dataToUpdate.cvUrl = up.secure_url;
      dataToUpdate.cvPublicId = up.public_id;
    } catch (e: any) {
      console.error('[Cloudinary][cv] ERROR', e?.message || e);
    }
  }

  // Elimina undefined (no toca campos que no mandaste)
  Object.keys(dataToUpdate).forEach((k) => dataToUpdate[k] === undefined && delete dataToUpdate[k]);

  if (Object.keys(dataToUpdate).length === 0) {
    return await prisma.perfil.findUnique({ where: { id: perfilId } });
  }

  const perfilActualizado = await prisma.perfil.update({
    where: { id: perfilId },
    data: dataToUpdate,
  });

  return perfilActualizado;
};
