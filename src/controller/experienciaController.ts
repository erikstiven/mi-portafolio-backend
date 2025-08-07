import { Request, Response } from 'express'
import prisma from '../prisma/client'

// Obtener todas las experiencias
export const getExperiencias = async (_req: Request, res: Response) => {
  try {
    const experiencias = await prisma.experiencia.findMany({
      orderBy: { fechaInicio: 'desc' },
    })
    res.json(experiencias)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener experiencias' })
  }
}

// Crear una nueva experiencia
export const createExperiencia = async (req: Request, res: Response) => {
  try {
    const { puesto, empresa, fechaInicio, fechaFin, actualmente, descripcion } = req.body
    const nueva = await prisma.experiencia.create({
      data: {
        puesto,
        empresa,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        actualmente,
        descripcion,
      },
    })
    res.status(201).json(nueva)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear experiencia' })
  }
}

// Actualizar una experiencia
export const updateExperiencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { puesto, empresa, fechaInicio, fechaFin, actualmente, descripcion } = req.body
    const actualizada = await prisma.experiencia.update({
      where: { id: Number(id) },
      data: {
        puesto,
        empresa,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        actualmente,
        descripcion,
      },
    })
    res.json(actualizada)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar experiencia' })
  }
}

// Eliminar experiencia
export const deleteExperiencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.experiencia.delete({
      where: { id: Number(id) },
    })
    res.json({ message: 'Experiencia eliminada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar experiencia' })
  }
}
