import { Router } from 'express';
import multer from 'multer';
import {
  getProyectos,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  uploadImagenProyecto
} from '../controller/proyectoController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Necesario para acceder al buffer

router.get('/', getProyectos);
router.post('/', verificarToken, createProyecto);
router.put('/:id', verificarToken, updateProyecto);
router.delete('/:id', verificarToken, deleteProyecto);

// 🔥 Esta es la nueva ruta para subir imagen
router.post('/upload', verificarToken, upload.single('file'), uploadImagenProyecto);

export default router;
