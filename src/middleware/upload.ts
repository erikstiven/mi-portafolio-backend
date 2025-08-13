import type { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const maxFileMB = Number(process.env.UPLOAD_MAX_FILE_MB || 10);
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const isImage = /^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.mimetype);
  const isPdf   = file.mimetype === 'application/pdf';

  switch (file.fieldname) {
    case 'cv':
      if (!isPdf) return cb(new Error('CV debe ser PDF'));     // <-- SOLO error (sin 2º arg)
      return cb(null, true);

    case 'foto':
    case 'logo':
      if (!isImage) return cb(new Error('Imagen inválida (png|jpg|jpeg|webp|svg)'));
      return cb(null, true);

    default:
      return cb(new Error('Campo de archivo no permitido'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: maxFileMB * 1024 * 1024, files: 3 },
  fileFilter,
});
