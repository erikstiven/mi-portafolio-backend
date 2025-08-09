import { Router } from 'express'
import {
  getRedes,
  createRed,
  updateRed,
  deleteRed
} from '../controller/redController'
import { verificarToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', getRedes)
router.post('/', verificarToken, createRed)
router.put('/:id', verificarToken, updateRed)
router.delete('/:id', verificarToken, deleteRed)

export default router
