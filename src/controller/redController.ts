import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';
import {
  redCreateSchema,
  redUpdateSchema,
  idParamSchema,
  redesQuerySchema,
} from '../validators/red';

// GET /api/redes  (paginado + includeInactive)
export const getRedes = async (req: Request, res: Response) => {
  const { page, pageSize, includeInactive } = redesQuerySchema.parse(req.query);
  const skip = (page - 1) * pageSize;

  const where = includeInactive ? {} : { activo: true };

  const [items, total] = await Promise.all([
    prisma.redSocial.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: 'asc' },
    }),
    prisma.redSocial.count({ where }),
  ]);

  res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
};

// POST /api/redes
export const createRed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = redCreateSchema.parse(req.body);
    const nueva = await prisma.redSocial.create({
      data: {
        ...data,
        activo: data.activo ?? true, // por defecto activa
      },
    });
    res.status(201).json(nueva);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // si tienes unique en nombre o url
      return res.status(409).json({ message: 'La red social ya existe' });
    }
    next(error);
  }
};

// PUT /api/redes/:id
export const updateRed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = redUpdateSchema.parse(req.body);

    const actualizada = await prisma.redSocial.update({
      where: { id },
      data,
    });

    res.json(actualizada);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Red social no encontrada' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Conflicto: nombre o URL ya existe' });
    }
    next(error);
  }
};

// PATCH /api/redes/:id/desactivar   (borrado lógico)
export const deleteRed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    await prisma.redSocial.update({
      where: { id },
      data: { activo: false },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Red social no encontrada' });
    }
    next(error);
  }
};
