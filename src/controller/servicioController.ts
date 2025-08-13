import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';
import { servicioCreateSchema, servicioUpdateSchema, idParamSchema } from '../validators/servicio';

// GET /api/servicios  (paginado)
export const getServicios = async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '50'), 10), 1), 100);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.servicio.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'asc' },
    }),
    prisma.servicio.count(),
  ]);

  res.json({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
};

// POST /api/servicios
export const createServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = servicioCreateSchema.parse(req.body);
    const nuevo = await prisma.servicio.create({ data });
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // si nombre es unique en tu schema
      return res.status(409).json({ message: 'El servicio ya existe' });
    }
    next(error);
  }
};

// PUT /api/servicios/:id
export const updateServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = servicioUpdateSchema.parse(req.body);

    const actualizado = await prisma.servicio.update({
      where: { id },
      data,
    });

    res.json(actualizado);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Conflicto: nombre ya existe' });
    }
    next(error);
  }
};

// DELETE /api/servicios/:id
export const deleteServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await prisma.servicio.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    next(error);
  }
};
