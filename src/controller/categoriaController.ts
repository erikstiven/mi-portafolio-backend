import { Request, Response } from 'express'
import prisma from '../prisma/client'

// Obtener todas las categorías
export const getCategorias = async (_req: Request, res: Response) => {
  try {
    const categorias = await prisma.categoria.findMany()
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías' })
  }
}

// Crear una nueva categoría
export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body
    const nueva = await prisma.categoria.create({
      data: { nombre },
    })
    res.status(201).json(nueva)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría' })
  }
}
// Actualizar una categoría
export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { nombre } = req.body
    const actualizada = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre },
    })
    res.json(actualizada)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría' })
  }
}

// Eliminar categoría
export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.categoria.delete({
      where: { id: Number(id) },
    })
    res.json({ message: 'Categoría eliminada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría' })
  }
}
