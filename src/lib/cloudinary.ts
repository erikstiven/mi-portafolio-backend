// src/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Faltan variables de Cloudinary en .env');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Sube un buffer a Cloudinary.
 * @param buffer Archivo en memoria
 * @param folder Carpeta destino (p.ej. "perfil" o "portfolio/perfil/fotoHero")
 * @param resourceType "image" | "raw" | "auto" (PDF usa "raw")
 */
export function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload sin resultado'));
        resolve({ url: result.secure_url!, public_id: result.public_id! });
      }
    );
    stream.end(buffer);
  });
}

/** Elimina un asset por publicId */
export async function destroyAsset(
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
) {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}
