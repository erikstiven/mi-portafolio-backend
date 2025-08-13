import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { categoriaCreateSchema, categoriaUpdateSchema, idParamSchema } from '../validators/categoria';
import { Prisma } from '@prisma/client';

// GET /api/categorias
export const getCategorias = async (req: Request, res: Response, _next: NextFunction) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '50'), 10), 1), 100);
  const skip = (page - 1) * pageSize;

  try {
    const [items, total] = await Promise.all([
      prisma.categoria.findMany({ skip, take: pageSize, orderBy: { id: 'asc' } }),
      prisma.categoria.count(),
    ]);

    res.json({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// POST /api/categorias
export const createCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categoriaCreateSchema.parse(req.body);
    const nueva = await prisma.categoria.create({ data });
    res.status(201).json(nueva);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // violación de única (si nombre es unique en tu schema)
      return res.status(409).json({ message: 'La categoría ya existe' });
    }
    next(error);
  }
};

// PUT /api/categorias/:id
export const updateCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = categoriaUpdateSchema.parse(req.body);

    const actualizada = await prisma.categoria.update({
      where: { id },
      data,
    });

    res.json(actualizada);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'La categoría ya existe' });
    }
    next(error);
  }
};

// DELETE /api/categorias/:id
export const deleteCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    await prisma.categoria.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    next(error);
  }
};
