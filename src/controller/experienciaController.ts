import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';
import {
  experienciaCreateSchema,
  experienciaUpdateSchema,
  idParamSchema,
  experienciasQuerySchema,
} from '../validators/experiencia';

// GET /api/experiencias  (paginado + filtro soloActuales)
export const getExperiencias = async (req: Request, res: Response) => {
  const { page, pageSize, soloActuales } = experienciasQuerySchema.parse(req.query);
  const skip = (page - 1) * pageSize;

  const where = soloActuales ? { actualmente: true } : {};

  const [items, total] = await Promise.all([
    prisma.experiencia.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fechaInicio: 'desc' },
    }),
    prisma.experiencia.count({ where }),
  ]);

  res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
};

// POST /api/experiencias
export const createExperiencia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = experienciaCreateSchema.parse(req.body);

    const nueva = await prisma.experiencia.create({
      data: {
        puesto: data.puesto,
        empresa: data.empresa,
        descripcion: data.descripcion,
        fechaInicio: data.fechaInicio,
        fechaFin: data.actualmente ? null : (data.fechaFin ?? null),
        actualmente: data.actualmente,
      },
    });

    res.status(201).json(nueva);
  } catch (error) {
    next(error);
  }
};

// PUT /api/experiencias/:id
export const updateExperiencia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = experienciaUpdateSchema.parse(req.body);

    // Construimos payload parcial
    const updateData: any = {
      puesto: data.puesto,
      empresa: data.empresa,
      descripcion: data.descripcion,
      fechaInicio: data.fechaInicio,
      actualmente: data.actualmente,
    };

    // Manejo de fechaFin y actualmente:
    // - Si setean actualmente=true -> forzamos fechaFin = null
    // - Si envían fechaFin (y no setean actualmente=true), la usamos
    if (data.actualmente === true) {
      updateData.fechaFin = null;
    } else if (typeof data.fechaFin !== 'undefined') {
      updateData.fechaFin = data.fechaFin ?? null;
    }

    const actualizada = await prisma.experiencia.update({
      where: { id },
      data: updateData,
    });

    res.json(actualizada);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Experiencia no encontrada' });
    }
    next(error);
  }
};

// DELETE /api/experiencias/:id
export const deleteExperiencia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await prisma.experiencia.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Experiencia no encontrada' });
    }
    next(error);
  }
};
