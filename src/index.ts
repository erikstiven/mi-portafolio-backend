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

// Usa el puerto que Render asigna; en local cae a 3001
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// CORS (puedes restringir orígenes cuando tengas tu dominio del front)
app.use(cors());
// app.use(cors({ origin: ['https://tu-frontend.vercel.app'] }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck / raíz
app.get('/', (_req, res) => {
  res.send('API OK');
});

// Rutas API
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRouter);
app.use('/api/servicios', servicioRoutes);
app.use('/api/redes', redesRoutes);
app.use('/api/experiencias', experienciaRoutes);
app.use('/api/perfil', perfilRoutes);

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

// IMPORTANTE en Render: escuchar en 0.0.0.0 (no localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
