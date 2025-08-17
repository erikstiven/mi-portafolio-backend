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

// Usa SIEMPRE el puerto de Render; en local cae a 3001
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

/* =======================
   HEALTHCHECK (ARRIBA)
   ======================= */
app.get('/health', (_req, res) => res.status(200).send('OK'));
app.head('/health', (_req, res) => res.sendStatus(200));

/* CORS: permite tu frontend en Vercel */
const ALLOWED_ORIGINS = [
  'https://mi-portafolio-frontend-sepia.vercel.app',
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // SSR / curl / Postman
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin no permitido -> ${origin}`));
  },
  methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false,
}));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Raíz informativa
app.get('/', (_req, res) => { res.send('API OK'); });

// Rutas API
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRouter);
app.use('/api/servicios', servicioRoutes);
app.use('/api/redes', redesRoutes);
app.use('/api/experiencias', experienciaRoutes);
app.use('/api/perfil', perfilRoutes);

// Manejo de errores
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
  if (err?.message?.startsWith('CORS:')) {
    return res.status(403).json({ message: err.message });
  }
  console.error('[Unhandled Error]', err);
  return res.status(500).json({ message: 'Error interno' });
});

// En Render: 0.0.0.0 y el puerto inyectado
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
