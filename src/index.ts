import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { ZodError } from 'zod';

import authRoutes from './routes/auth';
import proyectoRoutes from './routes/proyectos';
import categoriasRouter from './routes/categorias';
import servicioRoutes from './routes/servicios';
import redesRoutes from './routes/redes';
import experienciaRoutes from './routes/experiencias';
import perfilRoutes from './routes/perfil';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
// opcional: app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRouter);
app.use('/api/servicios', servicioRoutes);
app.use('/api/redes', redesRoutes);
app.use('/api/experiencias', experienciaRoutes);
app.use('/api/perfil', perfilRoutes);

// 404 opcional
// app.use((_req, res) => res.status(404).json({ message: 'No encontrado' }));

// Manejo de errores (Multer + Zod + genérico)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validación fallida',
      issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  const msg = err?.message ?? '';
  if (
    msg.includes('Campo de archivo no permitido') ||
    msg.includes('CV debe ser PDF') ||
    msg.includes('Imagen inválida')
  ) {
    return res.status(400).json({ message: msg });
  }
  console.error('[Unhandled Error]', err);
  return res.status(500).json({ message: 'Error interno' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
