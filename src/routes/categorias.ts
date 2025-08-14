// routes/categoriaRoutes.ts
import { Router } from 'express';
import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../controller/categoriaController';
import { verificarToken } from '../middleware/authMiddleware';  // Importar el middleware para verificar el token

const router = Router();

// Rutas
router.get('/', listarCategorias);  // Listar categorías (sin autenticación)
router.post('/', verificarToken, crearCategoria);  // Crear categoría (requiere autenticación)
router.put('/:id', verificarToken, actualizarCategoria);  // Actualizar categoría (requiere autenticación)
router.delete('/:id', verificarToken, eliminarCategoria);  // Eliminar categoría (requiere autenticación)

export default router;
