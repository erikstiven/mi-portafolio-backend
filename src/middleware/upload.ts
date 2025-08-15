// src/middleware/upload.ts
import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const isImage = /^image\//.test(file.mimetype);
  const isPdf = file.mimetype === 'application/pdf';

  if (file.fieldname === 'cv') {
    return isPdf ? cb(null, true) : cb(new Error('CV debe ser PDF'));
  }
  if (file.fieldname === 'fotoHero' || file.fieldname === 'fotoSobreMi') {
    return isImage ? cb(null, true) : cb(new Error('Imagen inválida'));
  }
  return cb(new Error('Campo de archivo no permitido'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
});
