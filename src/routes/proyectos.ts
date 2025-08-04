import { Router } from 'express'
import {
  getProyectos,
  createProyecto,
  updateProyecto,
  deleteProyecto
} from '../controller/proyectoController'

import { verificarToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', verificarToken, getProyectos)
router.post('/', verificarToken, createProyecto)
router.put('/:id', verificarToken, updateProyecto)
router.delete('/:id', verificarToken, deleteProyecto)

export default router
