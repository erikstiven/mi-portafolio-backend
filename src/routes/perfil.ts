// src/routes/perfil.ts
import { Router } from 'express';
import { verificarToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';
import { getPerfil, createPerfil, updatePerfil, deletePerfil } from '../controller/perfilController';

const router = Router();
const FILE_FIELDS = [
  { name: 'fotoHero', maxCount: 1 },
  { name: 'fotoSobreMi', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
];

router.get('/', getPerfil);

router.post(
  '/',
  verificarToken,
  upload.fields(FILE_FIELDS),
  createPerfil
);

router.put(
  '/',
  verificarToken,
  upload.fields(FILE_FIELDS),
  updatePerfil
);

router.delete('/', verificarToken, deletePerfil);

export default router;
