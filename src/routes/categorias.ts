import { Router } from 'express'
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controller/categoriaController'
import { verificarToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', getCategorias)
router.post('/', verificarToken, createCategoria)
router.put('/:id', verificarToken, updateCategoria)
router.delete('/:id', verificarToken, deleteCategoria)

export default router
