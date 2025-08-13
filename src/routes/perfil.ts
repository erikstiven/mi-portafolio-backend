import { Router } from 'express';
import { getPerfil, updatePerfil, uploadPerfilAssets } from '../controller/perfilController';
import { verificarToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = Router();

// Público
router.get('/', getPerfil);

// Privado (JSON puro)
router.put('/', verificarToken, updatePerfil);

// Privado (multipart form-data: textos + archivos)
router.post(
  '/assets',
  verificarToken,
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'cv',   maxCount: 1 },
  ]),
  uploadPerfilAssets
);

export default router;
