import { Router } from 'express';
import { verificarToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';
import {
  listProyectos,
  getProyecto,
  createProyecto,
  updateProyecto,
  removeProyecto,
} from '../controller/proyectoController';

const router = Router();

// públicos
router.get('/', listProyectos);
router.get('/:id', getProyecto);

// privados
router.post('/', verificarToken, upload.single('portada'), createProyecto);
router.put('/:id', verificarToken, upload.single('portada'), updateProyecto);
router.delete('/:id', verificarToken, removeProyecto);

export default router;
