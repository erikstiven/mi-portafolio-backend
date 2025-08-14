// controllers/categoriaController.ts
import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.categoria.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'desc' }
      }),
      prisma.categoria.count()
    ]);

    res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};
