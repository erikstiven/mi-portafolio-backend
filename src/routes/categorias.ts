// routes/categoriaRoutes.ts
import { Router } from 'express';
import { listarCategorias } from '../controller/categoriaController';

const router = Router();

router.get('/', listarCategorias);

export default router;
