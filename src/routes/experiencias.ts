import { Router } from 'express'
import {
  getExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from '../controller/experienciaController'
import { verificarToken } from '../middleware/authMiddleware'

const router = Router()
// GET público (sin autenticación)
router.get('/', getExperiencias)
router.post('/', verificarToken, createExperiencia)
router.put('/:id', verificarToken, updateExperiencia)
router.delete('/:id', verificarToken, deleteExperiencia)

export default router
