import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Faltan variables de Cloudinary en .env');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true, // <-- asegura https
});

export function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
) {
  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        overwrite: true,     // si re-subes a mismo public_id, lo reemplaza
        invalidate: true,    // invalida cache CDN
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload sin resultado'));
        resolve({ url: result.secure_url!, public_id: result.public_id! });
      }
    );
    stream.end(buffer);
  });
}

export async function destroyAsset(
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
) {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}
