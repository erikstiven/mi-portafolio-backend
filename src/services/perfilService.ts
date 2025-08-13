import prisma from '../prisma/client';
import { uploadBuffer, destroyAsset } from '../lib/cloudinary';

type UploadResult = { url: string; public_id: string };

export async function processPerfilUpsert(opts: {
  // Campos de texto requeridos
  nombreCompleto: string;
  inicialesLogo: string;
  telefono: string;
  heroTitulo: string;
  heroDescripcion: string;
  sobreDescripcion: string;
  // Opcionales
  heroCtaTexto?: string | null;
  heroCtaUrl?: string | null;

  // Buffers opcionales (multer) – si llegan, se reemplazan assets
  fotoBuffer?: Buffer;
  logoBuffer?: Buffer;
  cvBuffer?: Buffer;
}) {
  // 1) Subimos primero (si hay buffers). Guardamos para “rollback” si falla BD.
  const newFoto: UploadResult | undefined = opts.fotoBuffer
    ? await uploadBuffer(opts.fotoBuffer, 'portfolio/perfil/foto', 'image')
    : undefined;

  const newLogo: UploadResult | undefined = opts.logoBuffer
    ? await uploadBuffer(opts.logoBuffer, 'portfolio/perfil/logo', 'image')
    : undefined;

  const newCv: UploadResult | undefined = opts.cvBuffer
    ? await uploadBuffer(opts.cvBuffer, 'portfolio/perfil/cv', 'raw')
    : undefined;

  // 2) Leemos existente para saber qué borrar luego
  const existing = await prisma.perfil.findUnique({ where: { id: 1 } });
  const oldPublics = {
    cv: existing?.cvPublicId,
    foto: existing?.fotoPublicId,
    logo: existing?.logoPublicId,
  };

  try {
    // 3) Upsert transaccional con los nuevos campos
    const perfil = await prisma.perfil.upsert({
      where: { id: 1 },
      update: {
        nombreCompleto: opts.nombreCompleto,
        inicialesLogo: opts.inicialesLogo,
        telefono: opts.telefono,
        heroTitulo: opts.heroTitulo,
        heroDescripcion: opts.heroDescripcion,
        heroCtaTexto: opts.heroCtaTexto ?? null,
        heroCtaUrl: opts.heroCtaUrl ?? null,
        sobreDescripcion: opts.sobreDescripcion,
        ...(newCv   ? { cvUrl: newCv.url,     cvPublicId: newCv.public_id } : {}),
        ...(newFoto ? { fotoUrl: newFoto.url, fotoPublicId: newFoto.public_id } : {}),
        ...(newLogo ? { logoUrl: newLogo.url, logoPublicId: newLogo.public_id } : {}),
      },
      create: {
        id: 1,
        nombreCompleto: opts.nombreCompleto,
        inicialesLogo: opts.inicialesLogo,
        telefono: opts.telefono,
        heroTitulo: opts.heroTitulo,
        heroDescripcion: opts.heroDescripcion,
        heroCtaTexto: opts.heroCtaTexto ?? null,
        heroCtaUrl: opts.heroCtaUrl ?? null,
        sobreDescripcion: opts.sobreDescripcion,
        ...(newCv   ? { cvUrl: newCv.url,     cvPublicId: newCv.public_id } : {}),
        ...(newFoto ? { fotoUrl: newFoto.url, fotoPublicId: newFoto.public_id } : {}),
        ...(newLogo ? { logoUrl: newLogo.url, logoPublicId: newLogo.public_id } : {}),
      },
    });

    // 4) Limpieza asíncrona de assets antiguos solo si se reemplazaron
    Promise.allSettled([
      newCv   && oldPublics.cv   ? destroyAsset(oldPublics.cv,   'raw')   : undefined,
      newFoto && oldPublics.foto ? destroyAsset(oldPublics.foto, 'image') : undefined,
      newLogo && oldPublics.logo ? destroyAsset(oldPublics.logo, 'image') : undefined,
    ]);

    return perfil;
  } catch (err) {
    // Si falló BD, limpiamos los nuevos para no dejar basura
    Promise.allSettled([
      newCv   ? destroyAsset(newCv.public_id,   'raw')   : undefined,
      newFoto ? destroyAsset(newFoto.public_id, 'image') : undefined,
      newLogo ? destroyAsset(newLogo.public_id, 'image') : undefined,
    ]);
    throw err;
  }
}
