import prisma from '../prisma/client';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

/**
 * Helper para subir buffers a Cloudinary y devolver UploadApiResponse
 */
const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
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

/**
 * Sube archivos a Cloudinary y actualiza el perfil
 */
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

  const dataToUpdate: any = {
    nombreCompleto,
    inicialesLogo,
    telefono,
    tituloHero,
    perfilTecnicoHero,
    descripcionHero,
    descripcionUnoSobreMi,
    descripcionDosSobreMi,
  };

  // --- Subida de archivos a Cloudinary ---
  if (fotoHeroBuffer) {
    const uploaded = await uploadBufferToCloudinary(
      fotoHeroBuffer,
      'perfil',
      `fotoHero_${perfilId}`,
      'image'
    );
    dataToUpdate.fotoHeroUrl = uploaded.secure_url;
    dataToUpdate.fotoHeroPublicId = uploaded.public_id;
  }

  if (fotoSobreMiBuffer) {
    const uploaded = await uploadBufferToCloudinary(
      fotoSobreMiBuffer,
      'perfil',
      `fotoSobreMi_${perfilId}`,
      'image'
    );
    dataToUpdate.fotoSobreMiUrl = uploaded.secure_url;
    dataToUpdate.fotoSobreMiPublicId = uploaded.public_id;
  }

  if (cvBuffer) {
    const uploaded = await uploadBufferToCloudinary(
      cvBuffer,
      'perfil',
      `cv_${perfilId}`,
      'raw'
    );
    dataToUpdate.cvUrl = uploaded.secure_url;
    dataToUpdate.cvPublicId = uploaded.public_id;
  }

  // --- Filtrar undefined ---
  Object.keys(dataToUpdate).forEach(
    (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  // Actualizar perfil en Prisma
  const perfilActualizado = await prisma.perfil.update({
    where: { id: perfilId },
    data: dataToUpdate,
  });

  return perfilActualizado;
};
