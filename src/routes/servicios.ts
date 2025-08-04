import { Router } from 'express'
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio
} from '../controller/servicioController'
import { verificarToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', verificarToken, getServicios)
router.post('/', verificarToken, createServicio)
router.put('/:id', verificarToken, updateServicio)
router.delete('/:id', verificarToken, deleteServicio)

export default router
