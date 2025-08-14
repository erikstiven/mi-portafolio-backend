// controllers/categoriaController.ts
import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Función para listar categorías con paginación
export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.categoria.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.categoria.count(),
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

// Función para crear una nueva categoría
export const crearCategoria = async (req: Request, res: Response) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre },
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Función para actualizar una categoría
export const actualizarCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Función para eliminar una categoría
export const eliminarCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const categoria = await prisma.categoria.delete({
      where: { id: parseInt(id) },
    });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};
