import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { proyectoCreateSchema, proyectoUpdateSchema } from '../validators/proyecto';
import { createProyectoWithImage, updateProyectoWithImage, deleteProyecto } from '../services/proyectoService';

/** GET /api/proyectos (lista con paginación) */
export const listProyectos = async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1), 50);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.proyecto.findMany({
      skip,
      take: pageSize,
      include: { categoria: true }, // relación singular
      orderBy: { createdAt: 'desc' },
    }),
    prisma.proyecto.count(),
  ]);

  res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
};

/** GET /api/proyectos/:id */
export const getProyecto = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: { categoria: true },
  });
  if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });

  res.json(proyecto);
};

/** POST /api/proyectos  (multipart: portada opcional, o enviar imagenUrl en JSON) */
export const createProyecto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = proyectoCreateSchema.parse(req.body);
    const portadaBuffer = (req as any).file?.buffer as Buffer | undefined;
    const imagenUrl = typeof req.body?.imagenUrl === 'string' ? req.body.imagenUrl : undefined;

    const proyecto = await createProyectoWithImage({
      ...data,
      portadaBuffer,
      imagenUrl,
    });

    res.status(201).json(proyecto);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/proyectos/:id  (multipart opcional, o imagenUrl en JSON) */
export const updateProyecto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const data = proyectoUpdateSchema.parse(req.body);
    const portadaBuffer = (req as any).file?.buffer as Buffer | undefined;
    const imagenUrl = typeof req.body?.imagenUrl === 'string' ? req.body.imagenUrl : undefined;

    const proyecto = await updateProyectoWithImage(id, {
      ...data,
      portadaBuffer,
      imagenUrl,
    });

    res.json(proyecto);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/proyectos/:id */
export const removeProyecto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    await deleteProyecto(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
